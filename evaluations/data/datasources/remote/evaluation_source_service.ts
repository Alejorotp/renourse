import { getRefreshClient } from '@/core';
import { Evaluation, evaluationFromJson } from '../../../domain/models/evaluation';
import { Score } from '../../../domain/models/score';
import { IEvaluationSource } from '../i_evaluation_source';

const DATABASE_NAME = 'flourse_460df99409';
const API_BASE_URL = 'https://roble-api.openlab.uninorte.edu.co/database';

export class EvaluationSourceService implements IEvaluationSource {
  private async get(url: string): Promise<Response> {
    const refreshClient = getRefreshClient();
    if (!refreshClient) {
      throw new Error('RefreshClient not initialized');
    }
    return refreshClient.get(url);
  }

  private async post(url: string, body: any): Promise<Response> {
    const refreshClient = getRefreshClient();
    if (!refreshClient) {
      throw new Error('RefreshClient not initialized');
    }
    return refreshClient.post(url, body);
  }

  private generateUniqueCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  async getByCategoryID(categoryId: string): Promise<Evaluation[]> {
    console.log('[EvaluationSourceService] getByCategoryID →', categoryId);
    try {
      const response = await this.get(
        `${API_BASE_URL}/${DATABASE_NAME}/read?tableName=Evaluations&categoryID=${encodeURIComponent(categoryId)}`
      );

      console.log('[EvaluationSourceService] getByCategoryID response status:', response.status);
      
      if (response.status === 200) {
        const jsonList = await response.json();
        const evaluations = Array.isArray(jsonList)
          ? jsonList.map((data) => evaluationFromJson(data))
          : [];
        console.log('[EvaluationSourceService] getByCategoryID ← count', evaluations.length);
        return evaluations;
      } else {
        console.error('[EvaluationSourceService] getByCategoryID failed:', response.status);
        return [];
      }
    } catch (e) {
      console.error('[EvaluationSourceService] getByCategoryID error:', e);
      return [];
    }
  }

  async getAllEval(): Promise<Evaluation[]> {
    console.log('[EvaluationSourceService] getAllEval →');
    try {
      const response = await this.get(
        `${API_BASE_URL}/${DATABASE_NAME}/read?tableName=Evaluations`
      );

      console.log('[EvaluationSourceService] getAllEval response status:', response.status);
      
      if (response.status === 200) {
        const jsonList = await response.json();
        const evaluations = Array.isArray(jsonList)
          ? jsonList.map((data) => evaluationFromJson(data))
          : [];
        console.log('[EvaluationSourceService] getAllEval ← count', evaluations.length);
        return evaluations;
      } else {
        console.error('[EvaluationSourceService] getAllEval failed:', response.status);
        return [];
      }
    } catch (e) {
      console.error('[EvaluationSourceService] getAllEval error:', e);
      return [];
    }
  }

  async createEvaluation(params: {
    name: string;
    categoryId: string;
    visibility: string;
    creationDate: string;
  }): Promise<void> {
    console.log('[EvaluationSourceService] createEvaluation →', params);
    
    const code = this.generateUniqueCode();
    
    try {
      const response = await this.post(
        `${API_BASE_URL}/${DATABASE_NAME}/insert`,
        {
          tableName: 'Evaluations',
          records: [
            {
              name: params.name,
              categoryID: params.categoryId,
              visibility: params.visibility,
              creationDate: params.creationDate,
              evaluationID: code,
            },
          ],
        }
      );

      console.log('[EvaluationSourceService] createEvaluation response status:', response.status);
      
      if (response.status !== 201) {
        console.error('[EvaluationSourceService] createEvaluation failed:', response.status);
        throw new Error('Failed to create evaluation');
      }

      console.log('[EvaluationSourceService] createEvaluation ← success, code:', code);
    } catch (e) {
      console.error('[EvaluationSourceService] createEvaluation error:', e);
      throw e;
    }
  }

  async getUserEvaluations(userId: string): Promise<Evaluation[]> {
    console.log('[EvaluationSourceService] getUserEvaluations →', userId);
    
    try {
      // Fetch user groups
      const groupsResponse = await this.get(
        `${API_BASE_URL}/${DATABASE_NAME}/read?tableName=GroupMember&userID=${encodeURIComponent(userId)}`
      );

      if (groupsResponse.status !== 200) {
        console.error('[EvaluationSourceService] getUserEvaluations: failed to fetch groups', groupsResponse.status);
        return [];
      }

      const groupMemberships = await groupsResponse.json();
      const userEvaluations: Evaluation[] = [];

      // For each group, get the categoryID and fetch evaluations
      for (const membership of groupMemberships) {
        const groupId = membership.groupID as string;
        
        // Get group details to get categoryID
        const groupResponse = await this.get(
          `${API_BASE_URL}/${DATABASE_NAME}/read?tableName=Group&_id=${encodeURIComponent(groupId)}`
        );

        if (groupResponse.status === 200) {
          const groupList = await groupResponse.json();
          if (groupList.length > 0) {
            const categoryID = groupList[0].categoryID;
            
            // Fetch evaluations for this category
            const evaluations = await this.getByCategoryID(categoryID);
            userEvaluations.push(...evaluations);
          }
        }
      }

      // Remove duplicates based on evaluationID
      const uniqueEvaluations = userEvaluations.filter(
        (evaluation, index, self) =>
          index === self.findIndex((e) => e.evaluationID === evaluation.evaluationID)
      );

      console.log('[EvaluationSourceService] getUserEvaluations ← count', uniqueEvaluations.length);
      return uniqueEvaluations;
    } catch (e) {
      console.error('[EvaluationSourceService] getUserEvaluations error:', e);
      return [];
    }
  }

  async getScoresByEvaluationID(evaluationId: string): Promise<string[]> {
    console.log('[EvaluationSourceService] getScoresByEvaluationID →', evaluationId);
    
    try {
      const response = await this.get(
        `${API_BASE_URL}/${DATABASE_NAME}/read?tableName=EvaluationScore&evaluationID=${encodeURIComponent(evaluationId)}`
      );

      if (response.status === 200) {
        const jsonList = await response.json();
        const scores = Array.isArray(jsonList)
          ? jsonList.map((data) =>
              JSON.stringify({
                punctuality: data.punctuality,
                contributions: data.contributions,
                commitment: data.commitment,
                attitude: data.attitude,
              })
            )
          : [];
        console.log('[EvaluationSourceService] getScoresByEvaluationID ← count', scores.length);
        return scores;
      } else {
        console.error('[EvaluationSourceService] getScoresByEvaluationID failed:', response.status);
        return [];
      }
    } catch (e) {
      console.error('[EvaluationSourceService] getScoresByEvaluationID error:', e);
      return [];
    }
  }

  async getScoresByGroupID(groupId: string, evaluationId: string): Promise<string[]> {
    console.log('[EvaluationSourceService] getScoresByGroupID →', { groupId, evaluationId });
    
    try {
      const response = await this.get(
        `${API_BASE_URL}/${DATABASE_NAME}/read?tableName=EvaluationScore&groupID=${encodeURIComponent(groupId)}&evaluationID=${encodeURIComponent(evaluationId)}`
      );

      if (response.status === 200) {
        const jsonList = await response.json();
        const scores = Array.isArray(jsonList)
          ? jsonList.map((data) =>
              JSON.stringify({
                punctuality: data.punctuality,
                contributions: data.contributions,
                commitment: data.commitment,
                attitude: data.attitude,
              })
            )
          : [];
        console.log('[EvaluationSourceService] getScoresByGroupID ← count', scores.length);
        return scores;
      } else {
        console.error('[EvaluationSourceService] getScoresByGroupID failed:', response.status);
        return [];
      }
    } catch (e) {
      console.error('[EvaluationSourceService] getScoresByGroupID error:', e);
      return [];
    }
  }

  async getScoresByCategoryID(categoryId: string, evaluationId: string): Promise<string[]> {
    console.log('[EvaluationSourceService] getScoresByCategoryID →', { categoryId, evaluationId });
    
    try {
      const response = await this.get(
        `${API_BASE_URL}/${DATABASE_NAME}/read?tableName=EvaluationScore&categoryID=${encodeURIComponent(categoryId)}&evaluationID=${encodeURIComponent(evaluationId)}`
      );

      if (response.status === 200) {
        const jsonList = await response.json();
        const scores = Array.isArray(jsonList)
          ? jsonList.map((data) =>
              JSON.stringify({
                punctuality: data.punctuality,
                contributions: data.contributions,
                commitment: data.commitment,
                attitude: data.attitude,
              })
            )
          : [];
        console.log('[EvaluationSourceService] getScoresByCategoryID ← count', scores.length);
        return scores;
      } else {
        console.error('[EvaluationSourceService] getScoresByCategoryID failed:', response.status);
        return [];
      }
    } catch (e) {
      console.error('[EvaluationSourceService] getScoresByCategoryID error:', e);
      return [];
    }
  }

  async getUserScores(userId: string, evaluationId: string): Promise<string[]> {
    console.log('[EvaluationSourceService] getUserScores →', { userId, evaluationId });
    
    try {
      const response = await this.get(
        `${API_BASE_URL}/${DATABASE_NAME}/read?tableName=EvaluationScore&userID=${encodeURIComponent(userId)}&evaluationID=${encodeURIComponent(evaluationId)}`
      );

      if (response.status === 200) {
        const jsonList = await response.json();
        const scores = Array.isArray(jsonList)
          ? jsonList.map((data) =>
              JSON.stringify({
                punctuality: data.punctuality,
                contributions: data.contributions,
                commitment: data.commitment,
                attitude: data.attitude,
              })
            )
          : [];
        console.log('[EvaluationSourceService] getUserScores ← count', scores.length);
        return scores;
      } else {
        console.error('[EvaluationSourceService] getUserScores failed:', response.status);
        return [];
      }
    } catch (e) {
      console.error('[EvaluationSourceService] getUserScores error:', e);
      return [];
    }
  }

  async getAllUserScores(userId: string): Promise<string[]> {
    console.log('[EvaluationSourceService] getAllUserScores →', userId);
    
    try {
      const response = await this.get(
        `${API_BASE_URL}/${DATABASE_NAME}/read?tableName=EvaluationScore&userID=${encodeURIComponent(userId)}`
      );

      if (response.status === 200) {
        const jsonList = await response.json();
        const scores = Array.isArray(jsonList)
          ? jsonList.map((data) =>
              JSON.stringify({
                punctuality: data.punctuality,
                contributions: data.contributions,
                commitment: data.commitment,
                attitude: data.attitude,
              })
            )
          : [];
        console.log('[EvaluationSourceService] getAllUserScores ← count', scores.length);
        return scores;
      } else {
        console.error('[EvaluationSourceService] getAllUserScores failed:', response.status);
        return [];
      }
    } catch (e) {
      console.error('[EvaluationSourceService] getAllUserScores error:', e);
      return [];
    }
  }

  async submitScore(params: {
    userId: string;
    evaluationId: string;
    groupID: string;
    categoryID: string;
    scores: Score;
  }): Promise<void> {
    console.log('[EvaluationSourceService] submitScore →', params);
    
    try {
      const response = await this.post(
        `${API_BASE_URL}/${DATABASE_NAME}/insert`,
        {
          tableName: 'EvaluationScore',
          records: [
            {
              userID: params.userId,
              evaluationID: params.evaluationId,
              groupID: params.groupID,
              categoryID: params.categoryID,
              punctuality: params.scores.punctuality,
              contributions: params.scores.contributions,
              commitment: params.scores.commitment,
              attitude: params.scores.attitude,
            },
          ],
        }
      );

      console.log('[EvaluationSourceService] submitScore response status:', response.status);
      
      if (response.status !== 200 && response.status !== 201) {
        console.error('[EvaluationSourceService] submitScore failed:', response.status);
        throw new Error('Failed to submit score');
      }

      console.log('[EvaluationSourceService] submitScore ← success');
    } catch (e) {
      console.error('[EvaluationSourceService] submitScore error:', e);
      throw e;
    }
  }
}
