import { Report } from '../models/report';
import { IReportRepository } from '../repositories/i_report_repository';

export class ReportUseCase {
  constructor(private repository: IReportRepository) {}

  async getAllReports(courseId: string): Promise<Report[]> {
    return this.repository.getAllReports(courseId);
  }

  async deleteReport(id: string): Promise<void> {
    return this.repository.deleteReport(id);
  }

  async getReportsByUserId(userId: string): Promise<Report[]> {
    return this.repository.getReportsByUserId(userId);
  }

  async getReportsByGroupId(groupId: string): Promise<Report[]> {
    return this.repository.getReportsByGroupId(groupId);
  }

  async getReportsByCategoryId(categoryId: string): Promise<Report[]> {
    return this.repository.getReportsByCategoryId(categoryId);
  }

  async getReportsByEvaluationId(evaluationId: string): Promise<Report[]> {
    return this.repository.getReportsByEvaluationId(evaluationId);
  }
}
