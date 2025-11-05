import { Report } from '../models/report';

export interface IReportRepository {
  getAllReports(courseId: string): Promise<Report[]>;
  deleteReport(id: string): Promise<void>;
  getReportsByUserId(userId: string): Promise<Report[]>;
  getReportsByGroupId(groupId: string): Promise<Report[]>;
  getReportsByEvaluationId(evaluationId: string): Promise<Report[]>;
  getReportsByCategoryId(categoryId: string): Promise<Report[]>;
}
