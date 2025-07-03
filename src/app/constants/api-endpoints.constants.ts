import { environment } from '../../environments/environment';

const BASE_API_URL = `${environment.API_URL}`;

/* ------------------------ AUTHENTICATION END POINTS ----------------------- */

export const LOGIN = `${BASE_API_URL}/auth/login`;
export const FORGOT_PASSWORD = `${BASE_API_URL}/auth/forgot-password`;
export const LOGOUT = `${BASE_API_URL}/auth/logout`;
export const REFRESH_TOKEN = `${BASE_API_URL}/authrefresh-jwt`;
export const CHECK_IF_EMAIL_EXISTS = `${BASE_API_URL}/email-exists`;

/* ---------------------------- SUBNET END POINTS --------------------------- */

export const GET_ALL_SUBNETS = `${BASE_API_URL}/subnets`;
export const ADD_SUBNET = `${BASE_API_URL}/subnets/`;
export const REMOVE_SUBNET = `${BASE_API_URL}/subnets/remove`;

/* ------------------------------ INDEX ROUTES ------------------------------ */
export const REQUEST_NEW_IP = `${BASE_API_URL}/request-ip`;
export const GET_ALL_SUMMARIZED_SUBNETS = `${BASE_API_URL}/summarized-subnets`;


/* ------------------------------- USER ROUTES ------------------------------ */
export const GET_ALL_USERS = `${BASE_API_URL}/users`;
export const ADD_USER = `${BASE_API_URL}/users`;
export const EDIT_USER = `${BASE_API_URL}/users`;
export const REMOVE_USER = `${BASE_API_URL}/users/remove`;

