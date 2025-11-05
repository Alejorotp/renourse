export interface Report {
  id: string;
  userId: string;
  evaluationId: string;
  groupId: string;
  categoryId: string;
  punctuality: number;
  contributions: number;
  commitment: number;
  attitude: number;
}

export const reportFromJson = (json: any): Report => {
  // Safely convert to number with fallback to 0
  const toNumber = (value: any): number => {
    if (value === null || value === undefined || value === '') return 0;
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  return {
    id: json._id || json.id || '',
    userId: json.userID || json.userId || '',
    evaluationId: json.evaluationID || json.evaluationId || '',
    groupId: json.groupID || json.groupId || '',
    categoryId: json.categoryID || json.categoryId || '',
    punctuality: toNumber(json.punctuality),
    contributions: toNumber(json.contributions),
    commitment: toNumber(json.commitment),
    attitude: toNumber(json.attitude),
  };
};

export const reportToJson = (report: Report): any => {
  return {
    _id: report.id,
    userID: report.userId,
    evaluationID: report.evaluationId,
    groupID: report.groupId,
    categoryID: report.categoryId,
    punctuality: report.punctuality,
    contributions: report.contributions,
    commitment: report.commitment,
    attitude: report.attitude,
  };
};
