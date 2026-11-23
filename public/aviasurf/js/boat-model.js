/* User-authored shuttle, normalized to the finale's existing local coordinates.
   Requires the matching Three r128 GLTFLoader before this script. */
class BoatModel {
  static preload() {
    if (!this.pending) {
      this.pending = new Promise((resolve, reject) => {
        if (!THREE.GLTFLoader) { reject(new Error('Boat GLTFLoader is unavailable')); return; }
        new THREE.GLTFLoader().load('assets/models/boat.glb', gltf => resolve(gltf.scene), undefined, reject);
      }).catch(error => { this.pending = null; throw error; });
    }
    return this.pending;
  }
  static async attach(parent, {fallback = [], onLoad = null, onError = null} = {}) {
    try {
      const source = await this.preload();
      const model = source.clone(true);
      model.name = 'Airport shuttle GLB';
      // Authored +90° X rotation makes Y up, but the bow points toward -Z.
      model.rotation.y = Math.PI;
      model.updateMatrixWorld(true);
      const bounds = new THREE.Box3().setFromObject(model);
      const size = bounds.getSize(new THREE.Vector3());
      const center = bounds.getCenter(new THREE.Vector3());
      const root = new THREE.Group();
      root.name = 'Boat visual';
      root.scale.set(8.8 / size.x, 1.8 / .124, 16 / size.z);
      model.position.set(-center.x, -bounds.min.y, -center.z);
      model.traverse(node => {
        if (!node.isMesh) return;
        node.castShadow = false;
        node.receiveShadow = false;
        const prepare = original => {
          const material = original.clone();
          material.metalness = .05;
          material.roughness = .88;
          if (material.map) material.map.anisotropy = 4;
          return material;
        };
        node.material = Array.isArray(node.material) ? node.material.map(prepare) : prepare(node.material);
      });
      root.add(model);
      parent.add(root);
      for (const object of Array.isArray(fallback) ? fallback : [fallback]) if (object) object.visible = false;
      root.userData.landingDeck = {y:1.8, z:-4, halfWidth:3.75};
      onLoad?.(root);
      return root;
    } catch (error) {
      // Keep the procedural craft playable if the asset cannot be downloaded.
      console.warn('Boat model unavailable; retaining fallback craft.', error);
      onError?.(error);
      return null;
    }
  }
}
if (typeof window !== 'undefined') window.BoatModel = BoatModel;
