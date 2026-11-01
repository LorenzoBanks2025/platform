import "server-only";
import {
  CreditCardModel,
  FullzModel,
  LeadsModel,
  UserGroupModel,
  UserModel,
  VisitorsModel,
} from "@nfa/database";
import { getDatabaseConnection } from "./database";

export function getPlatformServer() {
  const connection = getDatabaseConnection();

  return {
    connection,
    users: new UserModel(connection),
    userGroups: new UserGroupModel(connection),
    creditCards: new CreditCardModel(connection),
    fullz: new FullzModel(connection),
    leads: new LeadsModel(connection),
    visitors: new VisitorsModel(connection),
  };
}
