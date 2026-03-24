import { PipelineName } from "@server/types";
import Phaser from "phaser";

const MultiPipeline = Phaser.Renderer.WebGL.Pipelines.MultiPipeline;

export class StretchPipeline extends MultiPipeline {
  private startTime: number = -999999;
  private amplitude: number = 0.15;
  private damping: number = 4.0;
  private squeeze: number = 0.5;

  constructor(game: Phaser.Game, name: string = PipelineName.STRETCH) {
    super({
      name: name,
      game: game,
      vertShader: `
        #define SHADER_NAME STRETCH_VERT

        #ifdef GL_FRAGMENT_PRECISION_HIGH
        precision highp float;
        #else
        precision mediump float;
        #endif

        uniform mat4 uProjectionMatrix;

        uniform float stretch_start_time;
        uniform float stretch_amplitude;
        uniform float stretch_damping;
        uniform float stretch_squeeze;
        uniform float current_time;

        attribute vec2 inPosition;
        attribute vec2 inTexCoord;
        attribute float inTexId;
        attribute float inTintEffect;
        attribute vec4 inTint;

        varying vec2 outTexCoord;
        varying float outTexId;
        varying float outTintEffect;
        varying vec4 outTint;

        void main() {
          vec2 position = inPosition;

          float elapsed = current_time - stretch_start_time;

          if (elapsed > 0.0 && elapsed < 600.0) {
            float normalizedY = inTexCoord.y;
            float vertexFactor = 1.0 - normalizedY;

            float t = elapsed / 600.0;
            float wave = sin(t * 4.712 - 1.5708);
            float envelope = 1.0 - t;
            float pull = stretch_amplitude * wave * envelope * vertexFactor;

            position.y -= pull * 80.0;
            position.x += (inTexCoord.x - 0.5) * pull * -40.0 * stretch_squeeze;
          }

          gl_Position = uProjectionMatrix * vec4(position, 1.0, 1.0);

          outTexCoord = inTexCoord;
          outTexId = inTexId;
          outTint = inTint;
          outTintEffect = inTintEffect;
        }
      `,
    });
  }

  onPreRender() {
    super.onPreRender();

    this.set1f("stretch_start_time", this.startTime);
    this.set1f("stretch_amplitude", this.amplitude);
    this.set1f("stretch_damping", this.damping);
    this.set1f("stretch_squeeze", this.squeeze);
    this.set1f("current_time", this.game.loop.time);
  }

  trigger(
    amplitude: number = 0.5,
    damping: number = 4.0,
    squeeze: number = 0.5,
  ) {
    this.startTime = this.game.loop.time;
    this.amplitude = amplitude;
    this.damping = damping;
    this.squeeze = squeeze;
  }
}
