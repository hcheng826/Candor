import moment from "moment";

export const formatDate = (date: Date | string | number) => {
  return moment(date).format("DD/MM/YYYY hh:mm");
};

export * from "./constants";
export * from "./ethers-parse";
export * from "./url-parse";
