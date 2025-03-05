import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from './src/DRACOLoader.js'; // 引入 DRACOLoader

// 创建白色的 PBR 材质
function createWhitePBRMaterial() {
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff, // 白色
    roughness: 0.5,   // 粗糙度
    metalness: 0.0    // 非金属
  });

  return material;
}

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.setSize(window.innerWidth, window.innerHeight);

renderer.setPixelRatio(window.devicePixelRatio);

renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.5;

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.width = 2048;
renderer.shadowMap.height = 2048;
renderer.setClearColor(0xA6A6A6); // 设置背景颜色为 #D6D2CA


document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(4, 8, 11);
camera.near = 1;
camera.far = 2000;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 5;
controls.maxDistance = 20;
controls.minPolarAngle = 0.5;
controls.maxPolarAngle = 1.5;
controls.autoRotate = false;
controls.target = new THREE.Vector3(0, 1, 0);
controls.update();

const spotLight = new THREE.SpotLight(0xffffff, 1500, 100, 10, 1);
spotLight.position.set(0, 30, 0);
spotLight.castShadow = true;
spotLight.shadow.bias = -0.001;  // 适当增大偏移
spotLight.shadow.normalBias = 0.0;  // 去除 normalBias
spotLight.shadow.mapSize.width = 2048;
spotLight.shadow.mapSize.height = 2048;
scene.add(spotLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 1);  // 环境光
scene.add(ambientLight);



const blueDirectionalLight = new THREE.DirectionalLight(0x8BACCF, 3);  // 蓝色光源，强度1
blueDirectionalLight.position.set(100, 100, 100);  // 设置光源位置在画面右侧
blueDirectionalLight.target.position.set(0, 0, 0);  // 设置光源照射的目标
blueDirectionalLight.castShadow = true;  // 启用阴影
blueDirectionalLight.shadow.mapSize.width = 2048;  // 设置阴影分辨率
blueDirectionalLight.shadow.mapSize.height = 2048;  // 设置阴影分辨率
scene.add(blueDirectionalLight);
scene.add(blueDirectionalLight.target);  // 添加目标物体


const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

let mixer;

loader.load('public/millennium_falcon/1.glb', (gltf) => {
  const model = gltf.scene;
  console.log(gltf.scene)
  console.log(model)
  // 创建白色 PBR 材质
  const whitePBRMaterial = createWhitePBRMaterial();

  // 遍历模型中的每个子物体
  model.traverse((child) => {
    if (child.isMesh) {
      // 如果物体没有材质，给它赋予白色 PBR 材质
      if (child.material.length === 0 || !child.material) {
        child.material = whitePBRMaterial;
      }

      // 设置阴影
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  model.position.set(0, 1, 0);
  model.scale.set(0.17,0.17,0.17)
  model.rotation.set(0,1.4,0)
  scene.add(model);

  mixer = new THREE.AnimationMixer(model);
  gltf.animations.forEach((clip) => {
    mixer.clipAction(clip).play();
  });

  
  document.getElementById('progress-container').style.display = 'none';
}, (xhr) => {
  console.log(`loading ${xhr.loaded / xhr.total * 100}%`);
}, (error) => {
  console.error(error);
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);

  if (mixer) mixer.update(0.01);
  controls.update();
  renderer.render(scene, camera);
}

animate();
