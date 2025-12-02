import { Report } from '../domain/models/report';
import { ReportUseCase } from '../domain/use_case/report_usecase';

export class ReportController {
  private reports: Report[] = [];

  constructor(private reportUseCase: ReportUseCase) { }

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

  groupAverageScore(groupId: string): number[] {
    const groupReports = this.reports.filter(r => r.groupId === groupId);
    return this.calculateAverages(groupReports);
  }

  userAverageScore(userId: string, filters?: { groupId?: string }): number[] {
    let userReports = this.reports.filter(r => r.userId === userId);
    if (filters?.groupId) {
      userReports = userReports.filter(r => r.groupId === filters.groupId);
    }
    return this.calculateAverages(userReports);
  }

  private calculateAverages(reports: Report[]): number[] {
    if (reports.length === 0) return [0, 0, 0, 0];
    const sum = reports.reduce(
      (acc, r) => [
        acc[0] + r.punctuality,
        acc[1] + r.contributions,
        acc[2] + r.commitment,
        acc[3] + r.attitude,
      ],
      [0, 0, 0, 0]
    );
    return sum.map(s => s / reports.length);
  }

  getReports(): Report[] {
    return this.reports;
  }
}
