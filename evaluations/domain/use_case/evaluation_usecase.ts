import { IEvaluationRepository } from '../repositories/i_evaluation_repository';
import { Evaluation } from '../models/evaluation';
import { Score } from '../models/score';

export class EvaluationUseCase {
  constructor(private repository: IEvaluationRepository) {}

  async getByCategoryID(categoryId: string): Promise<Evaluation[]> {
    return await this.repository.getByCategoryID(categoryId);
  }

  async getAllEval(): Promise<Evaluation[]> {
    return await this.repository.getAllEval();
  }

  async createEvaluation(params: {
    name: string;
    categoryId: string;
    visibility: string;
    creationDate: string;
  }): Promise<void> {
    return await this.repository.createEvaluation(params);
  }

  async getUserEvaluations(userId: string): Promise<Evaluation[]> {
    return await this.repository.getUserEvaluations(userId);
  }

  async getScoresByEvaluationID(evaluationId: string): Promise<string[]> {
    return await this.repository.getScoresByEvaluationID(evaluationId);
  }

  async getScoresByGroupID(groupId: string, evaluationId: string): Promise<string[]> {
    return await this.repository.getScoresByGroupID(groupId, evaluationId);
  }

  async getScoresByCategoryID(categoryId: string, evaluationId: string): Promise<string[]> {
    return await this.repository.getScoresByCategoryID(categoryId, evaluationId);
  }

  async getUserScores(userId: string, evaluationId: string): Promise<string[]> {
    return await this.repository.getUserScores(userId, evaluationId);
  }

  async getAllUserScores(userId: string): Promise<string[]> {
    return await this.repository.getAllUserScores(userId);
  }

  async submitScore(params: {
    userId: string;
    evaluationId: string;
    groupID: string;
    categoryID: string;
    scores: Score;
  }): Promise<void> {
    return await this.repository.submitScore(params);
  }
}
