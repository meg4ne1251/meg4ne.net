# 第11章: 3Dモデルビューワー

## この章で学ぶこと

- React Three Fiber（R3F）の基礎
- `.glb` 形式と Draco 圧縮
- Lazy Load パターン（要件定義書のUXフロー）
- 自動回転 + ユーザー操作の実装

---

## 11.1 技術選定の背景

要件定義書の仕様：
- ファイル形式: `.glb`（glTF Binary）+ Draco 圧縮
- UX: プレビュー画像 → クリックで3Dビューワー起動
- 挙動: 自動回転 + ユーザー操作（視点移動）

### なぜ React Three Fiber なのか

Three.js（WebGL の高水準ラッパー）を React の宣言的な書き方で使えるライブラリです。

```
Three.js（命令的）:
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(...);
  const renderer = new THREE.WebGLRenderer();
  // ... 数十行のセットアップコード

React Three Fiber（宣言的）:
  <Canvas>
    <mesh>
      <boxGeometry />
      <meshStandardMaterial color="orange" />
    </mesh>
  </Canvas>
  // 上記だけで3Dシーンが表示される
```

### パッケージのインストール

```bash
pnpm add three @react-three/fiber @react-three/drei
pnpm add -D @types/three
```

| パッケージ | 役割 |
|---|---|
| `three` | WebGL ライブラリ本体 |
| `@react-three/fiber` | Three.js の React バインディング |
| `@react-three/drei` | 便利なヘルパーコンポーネント集（OrbitControls, Loaderなど） |
| `@types/three` | Three.js の TypeScript 型定義 |

---

## 11.2 基本的な3Dシーン

まず最小限の3Dシーンから始めましょう：

```tsx
// src/components/viewer/SimpleScene.tsx
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

export default function SimpleScene() {
  return (
    <div style={{ width: "100%", height: "500px" }}>
      <Canvas
        camera={{ position: [0, 2, 5], fov: 50 }}
        style={{ background: "#0a0a0f" }}
      >
        {/* 環境光（全体を均一に照らす） */}
        <ambientLight intensity={0.5} />

        {/* 方向光（太陽光のような一方向からの光） */}
        <directionalLight position={[5, 5, 5]} intensity={1} />

        {/* ボックスメッシュ（テスト用） */}
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#6c9bff" />
        </mesh>

        {/* カメラ操作（ドラッグで回転、スクロールでズーム） */}
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}
```

### Canvas コンポーネントの構造

```
<Canvas>                           ← WebGL レンダラーの初期化
  <ambientLight />                 ← ライト（光がないと真っ暗）
  <directionalLight />             ← もう1つのライト
  <mesh>                           ← 3Dオブジェクト
    <boxGeometry />                ← オブジェクトの形状
    <meshStandardMaterial />       ← オブジェクトの見た目（材質）
  </mesh>
  <OrbitControls />                ← マウスでの視点操作
</Canvas>
```

---

## 11.3 .glb モデルの読み込み

### .glb ファイルの配置

```
public/assets/models/
├── character.glb       # 3Dモデル
├── vehicle.glb
└── draco/              # Draco デコーダ（後述）
    ├── draco_decoder.js
    ├── draco_decoder.wasm
    └── draco_wasm_wrapper.js
```

### モデルローダーコンポーネント

```tsx
// src/components/viewer/ModelViewer.tsx
import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, Center } from "@react-three/drei";
import type { Group } from "three";

// --- モデルを読み込むコンポーネント ---
interface ModelProps {
  modelPath: string;
  autoRotate?: boolean;
}

function Model({ modelPath, autoRotate = true }: ModelProps) {
  const { scene } = useGLTF(modelPath);
  const groupRef = useRef<Group>(null);

  // 毎フレーム実行される関数（自動回転）
  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5;  // Y軸周りに回転
    }
  });

  return (
    <Center>
      <group ref={groupRef}>
        {/* clone: true で同じモデルを複数回使えるようにする */}
        <primitive object={scene.clone()} />
      </group>
    </Center>
  );
}

// --- メインのビューワーコンポーネント ---
interface ModelViewerProps {
  modelPath: string;
  height?: string;
}

export default function ModelViewer({ modelPath, height = "500px" }: ModelViewerProps) {
  return (
    <div style={{ width: "100%", height, borderRadius: "8px", overflow: "hidden" }}>
      <Canvas
        camera={{ position: [0, 1.5, 3], fov: 50 }}
        style={{ background: "#0a0a0f" }}
      >
        {/* 環境マップ（リアルな反射を実現） */}
        <Environment preset="city" />

        {/* ライティング */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />

        {/* Suspense: モデル読み込み中のフォールバック */}
        <Suspense fallback={null}>
          <Model modelPath={modelPath} />
        </Suspense>

        {/* カメラ操作 */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={1}
          maxDistance={10}
          maxPolarAngle={Math.PI / 1.5}  // 真下からは見せない
        />
      </Canvas>
    </div>
  );
}
```

### Draco 圧縮の設定

Draco は Google 開発の3Dデータ圧縮技術で、`.glb` ファイルのサイズを大幅に削減します。

```tsx
// Draco デコーダの設定（useGLTF を使う前に一度だけ呼ぶ）
import { useGLTF } from "@react-three/drei";

// Draco デコーダのパスを設定
// CDN から読み込む方法（簡単）
useGLTF.preload("/assets/models/character.glb");

// または、ローカルのデコーダを使う場合
// Draco デコーダファイルを public/draco/ に配置
// three/examples/jsm/libs/draco/ からコピーする
```

```bash
# Three.js の Draco デコーダファイルをコピー
mkdir -p public/draco
cp node_modules/three/examples/jsm/libs/draco/gltf/* public/draco/
```

---

## 11.4 Lazy Load パターンの実装

要件定義書の UX フロー：
1. ページ読み込み時は「プレビュー画像」のみ表示
2. ユーザーが画像をクリックしたら3Dモデルをロード

```tsx
// src/components/viewer/LazyModelViewer.tsx
import { useState } from "react";
import ModelViewer from "./ModelViewer";

interface LazyModelViewerProps {
  modelPath: string;
  previewImage: string;
  alt: string;
  title?: string;
}

export default function LazyModelViewer({
  modelPath,
  previewImage,
  alt,
  title,
}: LazyModelViewerProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  if (!isLoaded) {
    // プレビュー画像の表示
    return (
      <div className="model-preview">
        <button
          onClick={() => setIsLoaded(true)}
          className="preview-button"
          aria-label={`${title || "3Dモデル"}を表示`}
        >
          <img
            src={previewImage}
            alt={alt}
            width={800}
            height={500}
            loading="lazy"
          />
          <div className="preview-overlay">
            <span className="play-icon">▶ 3Dで見る</span>
          </div>
        </button>
      </div>
    );
  }

  // 3Dビューワーの表示
  return (
    <div className="model-viewer-container">
      {title && <h3>{title}</h3>}
      <ModelViewer modelPath={modelPath} height="500px" />
      <button
        onClick={() => setIsLoaded(false)}
        className="close-viewer"
      >
        プレビューに戻す
      </button>
    </div>
  );
}
```

### Astro ページでの使い方

```astro
---
// src/pages/activities/index.astro
import Layout from "../../layouts/Layout.astro";
import LazyModelViewer from "../../components/viewer/LazyModelViewer";
---

<Layout title="活動記録">
  <h1>活動記録</h1>

  <section>
    <h2>3Dモデル作品</h2>
    <div class="models-grid">
      <!-- client:visible で、スクロールして見える位置に来てから初めて React をロード -->
      <LazyModelViewer
        client:visible
        modelPath="/assets/models/character.glb"
        previewImage="/assets/images/models/character-preview.webp"
        alt="キャラクターモデルのプレビュー"
        title="キャラクターモデル"
      />
    </div>
  </section>
</Layout>
```

### パフォーマンスの最適化ポイント

```
ページ読み込み時:
  ├── HTML + CSS のみ → 高速
  ├── プレビュー画像（WebP, 軽量）      ← これだけ読み込む
  └── Three.js, React Three Fiber → 未ロード

ユーザーがクリック:
  ├── React Three Fiber をロード（~200KB gzipped）
  ├── Three.js をロード（~600KB gzipped）
  └── .glb モデルファイルをロード（Draco圧縮済み）
```

この段階的な読み込みにより、初期ロード時間を最小限に抑えつつ、3D体験を提供できます。

---

## 11.5 この章のまとめ

### 重要なポイント

1. **React Three Fiber で宣言的に3Dシーンを構築**
2. **`.glb` + Draco 圧縮でファイルサイズを削減**
3. **Lazy Load パターンで初期ロードを軽量化**（プレビュー画像 → クリックで3D）
4. **`client:visible` で React コンポーネント自体も遅延ロード**
5. **自動回転 + OrbitControls でインタラクティブな操作**

### 実装チェックリスト

- [ ] テスト用の `.glb` ファイルが `public/assets/models/` にある
- [ ] 3Dモデルが正しく表示される
- [ ] 自動回転が動作する
- [ ] マウス操作（回転、ズーム）が動作する
- [ ] プレビュー画像クリックで3Dビューワーに切り替わる

---

次の章: [第12章: 外部API連携](./12-external-api.md)
