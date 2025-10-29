export interface Group {
  id: string;
  memberIDs: string[];
  groupNumber: number;
  categoryID: string;
}

export const groupFromJson = (json: any): Group => {
  return {
    id: json._id as string,
    memberIDs: (json.memberIDs as any[]).map((id) => id as string),
    categoryID: json.categoryID as string,
    groupNumber: json.groupNumber || 0,
  };
};

export const groupToJson = (group: Group): any => {
  return {
    _id: group.id,
    memberIDs: group.memberIDs,
    categoryID: group.categoryID,
    groupNumber: group.groupNumber,
  };
};
