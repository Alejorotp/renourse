import { Evaluation } from '../models/evaluation';
import { Score } from '../models/score';

export interface IEvaluationRepository {
  getByCategoryID(categoryId: string): Promise<Evaluation[]>;
  getAllEval(): Promise<Evaluation[]>;
  createEvaluation(params: {
    name: string;
    categoryId: string;
    visibility: string;
    creationDate: string;
  }): Promise<void>;
  getUserEvaluations(userId: string): Promise<Evaluation[]>;
  getScoresByEvaluationID(evaluationId: string): Promise<string[]>;
  getScoresByGroupID(groupId: string, evaluationId: string): Promise<string[]>;
  getScoresByCategoryID(categoryId: string, evaluationId: string): Promise<string[]>;
  getUserScores(userId: string, evaluationId: string): Promise<string[]>;
  getAllUserScores(userId: string): Promise<string[]>;
  submitScore(params: {
    userId: string;
    evaluationId: string;
    groupID: string;
    categoryID: string;
    scores: Score;
  }): Promise<void>;
}
