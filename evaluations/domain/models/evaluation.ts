export interface Evaluation {
  name: string;
  categoryID: string;
  evaluationID: string;
  creationDate: string;
  visibility: string;
}

export function evaluationFromJson(json: any): Evaluation {
  return {
    name: json.name || '',
    categoryID: json.categoryID || '',
    evaluationID: json._id || json.evaluationID || '',
    creationDate: json.creationDate || '',
    visibility: json.visibility || '',
  };
}
