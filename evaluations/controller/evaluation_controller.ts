import { Evaluation } from '../domain/models/evaluation';
import { Score } from '../domain/models/score';
import { EvaluationUseCase } from '../domain/use_case/evaluation_usecase';

export class EvaluationController {
  private evaluations: Evaluation[] = [];
  private userEvals: Evaluation[] = [];

  constructor(private evaluationUseCase: EvaluationUseCase) {}

  async fetchEvaluationsByCategory(categoryId: string): Promise<Evaluation[]> {
    console.log('[EvaluationController] fetchEvaluationsByCategory →', categoryId);
    const fetchedEvaluations = await this.evaluationUseCase.getByCategoryID(categoryId);
    this.evaluations = fetchedEvaluations;
    console.log('[EvaluationController] fetchEvaluationsByCategory ← count', fetchedEvaluations.length);
    return fetchedEvaluations;
  }

  async fetchAllEvaluations(): Promise<Evaluation[]> {
    console.log('[EvaluationController] fetchAllEvaluations →');
    const fetchedEvaluations = await this.evaluationUseCase.getAllEval();
    this.evaluations = fetchedEvaluations;
    console.log('[EvaluationController] fetchAllEvaluations ← count', fetchedEvaluations.length);
    return fetchedEvaluations;
  }

  async createEvaluation(params: {
    name: string;
    categoryId: string;
    visibility: string;
    creationDate: string;
  }): Promise<void> {
    console.log('[EvaluationController] createEvaluation →', params);
    await this.evaluationUseCase.createEvaluation(params);
    
    // Add to local list
    this.evaluations.push({
      evaluationID: Date.now().toString(),
      name: params.name,
      categoryID: params.categoryId,
      visibility: params.visibility,
      creationDate: params.creationDate,
    });
    console.log('[EvaluationController] createEvaluation ← success');
  }

  getAllEvaluations(): Evaluation[] {
    return this.evaluations;
  }

  async getUserEvaluations(userId: string): Promise<Evaluation[]> {
    console.log('[EvaluationController] getUserEvaluations →', userId);
    const fetchedEvaluations = await this.evaluationUseCase.getUserEvaluations(userId);
    this.userEvals = fetchedEvaluations;
    console.log('[EvaluationController] getUserEvaluations ← count', fetchedEvaluations.length);
    return fetchedEvaluations;
  }

  getEvaluationById(id: string): string {
    const evaluation = this.evaluations.find((evaluation) => evaluation.evaluationID === id);
    return evaluation ? evaluation.name : 'Unknown Evaluation';
  }

  async getScoresByCategoryID(categoryId: string, evaluationId: string): Promise<string[]> {
    return this.evaluationUseCase.getScoresByCategoryID(categoryId, evaluationId);
  }

  async getScoresByEvaluationID(evaluationId: string): Promise<string[]> {
    return this.evaluationUseCase.getScoresByEvaluationID(evaluationId);
  }

  async getScoresByGroupID(groupId: string, evaluationId: string): Promise<string[]> {
    return this.evaluationUseCase.getScoresByGroupID(groupId, evaluationId);
  }

  async submitScore(params: {
    userId: string;
    evaluationId: string;
    groupID: string;
    categoryID: string;
    scores: Score;
  }): Promise<void> {
    return this.evaluationUseCase.submitScore(params);
  }

  async getUserScores(userId: string, evaluationId: string): Promise<string[]> {
    return this.evaluationUseCase.getUserScores(userId, evaluationId);
  }

  async getAllUserScores(userId: string): Promise<string[]> {
    return this.evaluationUseCase.getAllUserScores(userId);
  }
}
