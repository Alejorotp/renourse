import { Report } from '../../domain/models/report';
import { IReportRepository } from '../../domain/repositories/i_report_repository';
import { IReportSource } from '../datasources/i_report_source';

export class ReportRepository implements IReportRepository {
  constructor(private reportSource: IReportSource) {}

  async getAllReports(courseId: string): Promise<Report[]> {
    return this.reportSource.getAllReports(courseId);
  }

  async deleteReport(id: string): Promise<void> {
    return this.reportSource.deleteReport(id);
  }

  async getReportsByUserId(userId: string): Promise<Report[]> {
    return this.reportSource.getReportsByUserId(userId);
  }

  async getReportsByGroupId(groupId: string): Promise<Report[]> {
    return this.reportSource.getReportsByGroupId(groupId);
  }

  async getReportsByEvaluationId(evaluationId: string): Promise<Report[]> {
    return this.reportSource.getReportsByEvaluationId(evaluationId);
  }

  async getReportsByCategoryId(categoryId: string): Promise<Report[]> {
    return this.reportSource.getReportsByCategoryId(categoryId);
  }
}
