import React, { createContext, ReactNode, useCallback, useContext } from 'react';
import { ReportController } from '../controller/report_controller';
import { ReportSourceService } from '../data/datasources/remote/report_source_service';
import { ReportRepository } from '../data/repositories/report_repository';
import { Report } from '../domain/models/report';
import { ReportUseCase } from '../domain/use_case/report_usecase';

// Singleton instances
let reportControllerInstance: ReportController | null = null;

const getReportController = (): ReportController => {
  if (!reportControllerInstance) {
    const reportSource = new ReportSourceService();
    const reportRepository = new ReportRepository(reportSource);
    const reportUseCase = new ReportUseCase(reportRepository);
    reportControllerInstance = new ReportController(reportUseCase);
  }
  return reportControllerInstance;
};

interface ReportContextType {
  fetchAllReports: (courseId: string) => Promise<Report[]>;
  fetchReportsByUserId: (userId: string) => Promise<Report[]>;
  fetchReportsByGroupId: (groupId: string) => Promise<Report[]>;
  fetchReportsByEvaluationId: (evaluationId: string) => Promise<Report[]>;
  fetchReportsByCategoryId: (categoryId: string) => Promise<Report[]>;
  deleteReport: (id: string, courseId?: string) => Promise<void>;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export const ReportProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const controller = getReportController();

  const fetchAllReports = useCallback(
    async (courseId: string): Promise<Report[]> => {
      return controller.fetchAllReports(courseId);
    },
    [controller]
  );

  const fetchReportsByUserId = useCallback(
    async (userId: string): Promise<Report[]> => {
      return controller.fetchReportsByUserId(userId);
    },
    [controller]
  );

  const fetchReportsByGroupId = useCallback(
    async (groupId: string): Promise<Report[]> => {
      return controller.fetchReportsByGroupId(groupId);
    },
    [controller]
  );

  const fetchReportsByEvaluationId = useCallback(
    async (evaluationId: string): Promise<Report[]> => {
      return controller.fetchReportsByEvaluationId(evaluationId);
    },
    [controller]
  );

  const fetchReportsByCategoryId = useCallback(
    async (categoryId: string): Promise<Report[]> => {
      return controller.fetchReportsByCategoryId(categoryId);
    },
    [controller]
  );

  const deleteReport = useCallback(
    async (id: string, courseId?: string): Promise<void> => {
      return controller.deleteReport(id, courseId);
    },
    [controller]
  );

  return (
    <ReportContext.Provider
      value={{
        fetchAllReports,
        fetchReportsByUserId,
        fetchReportsByGroupId,
        fetchReportsByEvaluationId,
        fetchReportsByCategoryId,
        deleteReport,
      }}
    >
      {children}
    </ReportContext.Provider>
  );
};

export const useReports = (): ReportContextType => {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useReports must be used within a ReportProvider');
  }
  return context;
};
