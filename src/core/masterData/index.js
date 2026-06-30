/**
 * MASTER DATA LIFECYCLE - PUBLIC API
 * Re-exports the canonical master data repository and service
 */

import masterEntityRepository from "./MasterEntityRepository";
import masterDataService from "../../services/masterDataService";

export { MASTER_ENTITY_TYPES } from "./MasterEntityRepository";
export { masterEntityRepository };
export default masterDataService;