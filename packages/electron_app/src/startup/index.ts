export default abstract class StartupStep {
  readonly stepDescription: string;

  protected constructor(stepDescription: string) {
    this.stepDescription = stepDescription;
  }

  abstract run(): Promise<void>;
}
