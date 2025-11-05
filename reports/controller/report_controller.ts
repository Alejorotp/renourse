import { Report } from '../domain/models/report';
import { ReportUseCase } from '../domain/use_case/report_usecase';

export class ReportController {
  private reports: Report[] = [];

  constructor(private reportUseCase: ReportUseCase) {}

  async fetchAllReports(courseId: string): Promise<Report[]> {
    try {
      const fetchedReports = await this.reportUseCase.getAllReports(courseId);
      this.reports = fetchedReports;
      console.log(`[ReportController] Fetched ${fetchedReports.length} reports for course ${courseId}`);
      return fetchedReports;
    } catch (e) {
      console.error('[ReportController] Error fetching reports:', e);
      throw e;
    }
  }

  async fetchReportsByUserId(userId: string): Promise<Report[]> {
    try {
      const fetchedReports = await this.reportUseCase.getReportsByUserId(userId);
      this.reports = fetchedReports;
      console.log(`[ReportController] Fetched ${fetchedReports.length} reports for user ${userId}`);
      return fetchedReports;
    } catch (e) {
      console.error('[ReportController] Error fetching reports by user:', e);
      throw e;
    }
  }

  async fetchReportsByGroupId(groupId: string): Promise<Report[]> {
    try {
      const fetchedReports = await this.reportUseCase.getReportsByGroupId(groupId);
      this.reports = fetchedReports;
      console.log(`[ReportController] Fetched ${fetchedReports.length} reports for group ${groupId}`);
      return fetchedReports;
    } catch (e) {
      console.error('[ReportController] Error fetching reports by group:', e);
      throw e;
    }
  }

  async fetchReportsByEvaluationId(evaluationId: string): Promise<Report[]> {
    try {
      const fetchedReports = await this.reportUseCase.getReportsByEvaluationId(evaluationId);
      this.reports = fetchedReports;
      console.log(`[ReportController] Fetched ${fetchedReports.length} reports for evaluation ${evaluationId}`);
      return fetchedReports;
    } catch (e) {
      console.error('[ReportController] Error fetching reports by evaluation:', e);
      throw e;
    }
  }

  async fetchReportsByCategoryId(categoryId: string): Promise<Report[]> {
    try {
      const fetchedReports = await this.reportUseCase.getReportsByCategoryId(categoryId);
      this.reports = fetchedReports;
      console.log(`[ReportController] Fetched ${fetchedReports.length} reports for category ${categoryId}`);
      return fetchedReports;
    } catch (e) {
      console.error('[ReportController] Error fetching reports by category:', e);
      throw e;
    }
  }

  async deleteReport(id: string, courseId?: string): Promise<void> {
    try {
      await this.reportUseCase.deleteReport(id);
      console.log(`[ReportController] Deleted report ${id}`);
      // Optionally refresh the list after deletion
      if (courseId) {
        await this.fetchAllReports(courseId);
      }
    } catch (e) {
      console.error('[ReportController] Error deleting report:', e);
      throw e;
    }
  }

  getReports(): Report[] {
    return this.reports;
  }
}
