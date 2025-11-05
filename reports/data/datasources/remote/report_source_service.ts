import { getRefreshClient } from '@/core';
import { Report, reportFromJson } from '../../../domain/models/report';
import { IReportSource } from '../i_report_source';

const DATABASE_NAME = 'flourse_460df99409';
const API_BASE_URL = 'https://roble-api.openlab.uninorte.edu.co/database';

export class ReportSourceService implements IReportSource {
  private async get(url: string): Promise<Response> {
    const refreshClient = getRefreshClient();
    if (!refreshClient) {
      throw new Error('RefreshClient not initialized');
    }
    return refreshClient.get(url);
  }

  private async delete(url: string): Promise<Response> {
    const refreshClient = getRefreshClient();
    if (!refreshClient) {
      throw new Error('RefreshClient not initialized');
    }
    return refreshClient.delete(url);
  }

  async getAllReports(courseId: string): Promise<Report[]> {
    try {
      // Reports are stored in EvaluationScore table
      const response = await this.get(
        `${API_BASE_URL}/${DATABASE_NAME}/read?tableName=EvaluationScore&courseID=${encodeURIComponent(courseId)}`
      );

      console.log('[ReportSourceService] getAllReports response status:', response.status);

      if (response.ok || response.status === 200) {
        const data = await response.json();
        console.log('[ReportSourceService] getAllReports data:', data);
        
        if (!Array.isArray(data)) {
          console.warn('[ReportSourceService] Response is not an array, returning empty array');
          return [];
        }
        
        return data.map((json: any) => reportFromJson(json));
      } else {
        console.error('[ReportSourceService] Failed to load reports, status:', response.status);
        return [];
      }
    } catch (e) {
      console.error('[ReportSourceService] Error loading reports:', e);
      return [];
    }
  }

  async deleteReport(id: string): Promise<void> {
    try {
      const response = await this.delete(
        `${API_BASE_URL}/${DATABASE_NAME}/delete?tableName=EvaluationScore&_id=${encodeURIComponent(id)}`
      );

      if (!response.ok && response.status !== 204 && response.status !== 200) {
        console.error('[ReportSourceService] Failed to delete report, status:', response.status);
      }
    } catch (e) {
      console.error('[ReportSourceService] Error deleting report:', e);
    }
  }

  async getReportsByUserId(userId: string): Promise<Report[]> {
    try {
      const response = await this.get(
        `${API_BASE_URL}/${DATABASE_NAME}/read?tableName=EvaluationScore&userID=${encodeURIComponent(userId)}`
      );

      if (response.ok || response.status === 200) {
        const data = await response.json();
        if (!Array.isArray(data)) {
          return [];
        }
        return data.map((json: any) => reportFromJson(json));
      } else {
        return [];
      }
    } catch (e) {
      console.error('[ReportSourceService] Error loading reports by user:', e);
      return [];
    }
  }

  async getReportsByUserIdAndGroupId(userId: string, groupId: string): Promise<Report[]> {
    try {
      const response = await this.get(
        `${API_BASE_URL}/${DATABASE_NAME}/read?tableName=EvaluationScore&userID=${encodeURIComponent(userId)}&groupID=${encodeURIComponent(groupId)}`
      );

      if (response.ok || response.status === 200) {
        const data = await response.json();
        if (!Array.isArray(data)) {
          return [];
        }
        return data.map((json: any) => reportFromJson(json));
      } else {
        return [];
      }
    } catch (e) {
      console.error('[ReportSourceService] Error loading reports by user and group:', e);
      return [];
    }
  }

  async getReportsByGroupId(groupId: string): Promise<Report[]> {
    try {
      const response = await this.get(
        `${API_BASE_URL}/${DATABASE_NAME}/read?tableName=EvaluationScore&groupID=${encodeURIComponent(groupId)}`
      );

      if (response.ok || response.status === 200) {
        const data = await response.json();
        if (!Array.isArray(data)) {
          return [];
        }
        return data.map((json: any) => reportFromJson(json));
      } else {
        return [];
      }
    } catch (e) {
      console.error('[ReportSourceService] Error loading reports by group:', e);
      return [];
    }
  }

  async getReportsByEvaluationId(evaluationId: string): Promise<Report[]> {
    try {
      const response = await this.get(
        `${API_BASE_URL}/${DATABASE_NAME}/read?tableName=EvaluationScore&evaluationID=${encodeURIComponent(evaluationId)}`
      );

      if (response.ok || response.status === 200) {
        const data = await response.json();
        if (!Array.isArray(data)) {
          return [];
        }
        return data.map((json: any) => reportFromJson(json));
      } else {
        return [];
      }
    } catch (e) {
      console.error('[ReportSourceService] Error loading reports by evaluation:', e);
      return [];
    }
  }

  async getReportsByCategoryId(categoryId: string): Promise<Report[]> {
    try {
      const response = await this.get(
        `${API_BASE_URL}/${DATABASE_NAME}/read?tableName=EvaluationScore&categoryID=${encodeURIComponent(categoryId)}`
      );

      if (response.ok || response.status === 200) {
        const data = await response.json();
        if (!Array.isArray(data)) {
          return [];
        }
        return data.map((json: any) => reportFromJson(json));
      } else {
        return [];
      }
    } catch (e) {
      console.error('[ReportSourceService] Error loading reports by category:', e);
      return [];
    }
  }
}
