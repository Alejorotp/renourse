import React, { createContext, useContext, useState } from 'react';
import { EvaluationSourceService } from '../data/datasources/remote/evaluation_source_service';
import { EvaluationRepository } from '../data/repositories/evaluation_repository';
import { EvaluationUseCase } from '../domain/use_case/evaluation_usecase';
import { EvaluationController } from '../controller/evaluation_controller';
import { Evaluation } from '../domain/models/evaluation';
import { Score } from '../domain/models/score';

interface EvaluationContextType {
  evaluations: Evaluation[];
  userEvals: Evaluation[];
  fetchEvaluationsByCategory: (categoryId: string) => Promise<void>;
  fetchAllEvaluations: () => Promise<void>;
  createEvaluation: (params: {
    name: string;
    categoryId: string;
    visibility: string;
    creationDate: string;
  }) => Promise<void>;
  getUserEvaluations: (userId: string) => Promise<Evaluation[]>;
  getEvaluationById: (id: string) => string;
  getScoresByCategoryID: (categoryId: string, evaluationId: string) => Promise<string[]>;
  getScoresByEvaluationID: (evaluationId: string) => Promise<string[]>;
  getScoresByGroupID: (groupId: string, evaluationId: string) => Promise<string[]>;
  submitScore: (params: {
    userId: string;
    evaluationId: string;
    groupID: string;
    categoryID: string;
    scores: Score;
  }) => Promise<void>;
  getUserScores: (userId: string, evaluationId: string) => Promise<string[]>;
  getAllUserScores: (userId: string) => Promise<string[]>;
}

const EvaluationContext = createContext<EvaluationContextType | undefined>(undefined);

const evaluationSource = new EvaluationSourceService();
const evaluationRepository = new EvaluationRepository(evaluationSource);
const evaluationUseCase = new EvaluationUseCase(evaluationRepository);
const evaluationController = new EvaluationController(evaluationUseCase);

export const EvaluationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [userEvals, setUserEvals] = useState<Evaluation[]>([]);

  const fetchEvaluationsByCategory = async (categoryId: string): Promise<void> => {
    const fetchedEvaluations = await evaluationController.fetchEvaluationsByCategory(categoryId);
    setEvaluations(fetchedEvaluations);
  };

  const fetchAllEvaluations = async (): Promise<void> => {
    const fetchedEvaluations = await evaluationController.fetchAllEvaluations();
    setEvaluations(fetchedEvaluations);
  };

  const createEvaluation = async (params: {
    name: string;
    categoryId: string;
    visibility: string;
    creationDate: string;
  }): Promise<void> => {
    await evaluationController.createEvaluation(params);
    // Refresh evaluations
    await fetchEvaluationsByCategory(params.categoryId);
  };

  const getUserEvaluations = async (userId: string): Promise<Evaluation[]> => {
    const fetchedEvaluations = await evaluationController.getUserEvaluations(userId);
    setUserEvals(fetchedEvaluations);
    return fetchedEvaluations;
  };

  const getEvaluationById = (id: string): string => {
    return evaluationController.getEvaluationById(id);
  };

  const getScoresByCategoryID = async (categoryId: string, evaluationId: string): Promise<string[]> => {
    return evaluationController.getScoresByCategoryID(categoryId, evaluationId);
  };

  const getScoresByEvaluationID = async (evaluationId: string): Promise<string[]> => {
    return evaluationController.getScoresByEvaluationID(evaluationId);
  };

  const getScoresByGroupID = async (groupId: string, evaluationId: string): Promise<string[]> => {
    return evaluationController.getScoresByGroupID(groupId, evaluationId);
  };

  const submitScore = async (params: {
    userId: string;
    evaluationId: string;
    groupID: string;
    categoryID: string;
    scores: Score;
  }): Promise<void> => {
    return evaluationController.submitScore(params);
  };

  const getUserScores = async (userId: string, evaluationId: string): Promise<string[]> => {
    return evaluationController.getUserScores(userId, evaluationId);
  };

  const getAllUserScores = async (userId: string): Promise<string[]> => {
    return evaluationController.getAllUserScores(userId);
  };

  return (
    <EvaluationContext.Provider
      value={{
        evaluations,
        userEvals,
        fetchEvaluationsByCategory,
        fetchAllEvaluations,
        createEvaluation,
        getUserEvaluations,
        getEvaluationById,
        getScoresByCategoryID,
        getScoresByEvaluationID,
        getScoresByGroupID,
        submitScore,
        getUserScores,
        getAllUserScores,
      }}
    >
      {children}
    </EvaluationContext.Provider>
  );
};

export const useEvaluations = (): EvaluationContextType => {
  const context = useContext(EvaluationContext);
  if (!context) {
    throw new Error('useEvaluations must be used within an EvaluationProvider');
  }
  return context;
};
