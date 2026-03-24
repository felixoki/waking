import { PipelineName } from "@server/types";
import { Scene } from "../scenes/Scene";
import { Entity } from "../Entity";
import { StretchPipeline } from "../pipelines/Stretch";

export const shaders = {
  illuminate: (scene: Scene, duration: number) => {
    const camera = scene.cameras.main;
    camera.setPostPipeline(PipelineName.ILLUMINATE);

    scene.time.delayedCall(duration, () => {
      camera.resetPostPipeline();
    });
  },

  stretch: (entity: Entity, onComplete?: () => void) => {
    const game = entity.scene.game;
    const renderer = game.renderer as Phaser.Renderer.WebGL.WebGLRenderer;
    const pipeline = new StretchPipeline(game);

    renderer.pipelines.add(PipelineName.STRETCH, pipeline);
    pipeline.trigger();

    entity.setPipeline(PipelineName.STRETCH);

    entity.scene.time.delayedCall(200, () => {
      entity.scene.tweens.add({
        targets: entity,
        y: entity.y - 6,
        duration: 400,
        ease: "Sine.easeOut",
      });
    });

    entity.scene.time.delayedCall(600, () => {
      entity.resetPipeline();
      renderer.pipelines.remove(PipelineName.STRETCH);
      onComplete?.();
    });
  },
};
