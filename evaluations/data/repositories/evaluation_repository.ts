import { Evaluation } from '../../domain/models/evaluation';
import { Score } from '../../domain/models/score';
import { IEvaluationRepository } from '../../domain/repositories/i_evaluation_repository';
import { IEvaluationSource } from '../datasources/i_evaluation_source';

export class EvaluationRepository implements IEvaluationRepository {
  constructor(private evalSource: IEvaluationSource) {}

  async getByCategoryID(categoryId: string): Promise<Evaluation[]> {
    return this.evalSource.getByCategoryID(categoryId);
  }

  async getAllEval(): Promise<Evaluation[]> {
    return this.evalSource.getAllEval();
  }

  async getUserEvaluations(userId: string): Promise<Evaluation[]> {
    return this.evalSource.getUserEvaluations(userId);
  }

  async createEvaluation(params: {
    name: string;
    categoryId: string;
    visibility: string;
    creationDate: string;
  }): Promise<void> {
    return this.evalSource.createEvaluation(params);
  }

  async getScoresByEvaluationID(evaluationId: string): Promise<string[]> {
    return this.evalSource.getScoresByEvaluationID(evaluationId);
  }

  async getScoresByGroupID(groupId: string, evaluationId: string): Promise<string[]> {
    return this.evalSource.getScoresByGroupID(groupId, evaluationId);
  }

  async getScoresByCategoryID(categoryId: string, evaluationId: string): Promise<string[]> {
    return this.evalSource.getScoresByCategoryID(categoryId, evaluationId);
  }

  async getUserScores(userId: string, evaluationId: string): Promise<string[]> {
    return this.evalSource.getUserScores(userId, evaluationId);
  }

  async getAllUserScores(userId: string): Promise<string[]> {
    return this.evalSource.getAllUserScores(userId);
  }

  async submitScore(params: {
    userId: string;
    evaluationId: string;
    groupID: string;
    categoryID: string;
    scores: Score;
  }): Promise<void> {
    return this.evalSource.submitScore(params);
  }
}
