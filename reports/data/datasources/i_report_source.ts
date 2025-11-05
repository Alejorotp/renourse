import { Report } from '../../domain/models/report';

export interface IReportSource {
  getAllReports(courseId: string): Promise<Report[]>;
  deleteReport(id: string): Promise<void>;
  getReportsByUserId(userId: string): Promise<Report[]>;
  getReportsByUserIdAndGroupId(userId: string, groupId: string): Promise<Report[]>;
  getReportsByGroupId(groupId: string): Promise<Report[]>;
  getReportsByEvaluationId(evaluationId: string): Promise<Report[]>;
  getReportsByCategoryId(categoryId: string): Promise<Report[]>;
}
