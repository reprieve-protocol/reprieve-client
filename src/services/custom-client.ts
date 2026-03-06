import Axios, { AxiosError } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api-reprieve-dev.nysm.work";

const getStorageItem = (key: string) => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(key);
};

export const AXIOS_INSTANCE = Axios.create({
  baseURL: API_BASE_URL,
});

AXIOS_INSTANCE.interceptors.request.use((config) => {
  const storageAddress = getStorageItem("wallet-address");
  if (storageAddress) {
    config.headers["wallet-address"] = storageAddress;
  }

  return config;
});

AXIOS_INSTANCE.interceptors.request.use((config) => {
  const token = getStorageItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

AXIOS_INSTANCE.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      window.localStorage.removeItem("token");
      window.localStorage.removeItem("wallet-address");
      window.dispatchEvent(new CustomEvent("auth:logout"));
    }

    return Promise.reject(error);
  },
);

export const customClient = <T>(
  url: string,
  options?: RequestInit,
): Promise<T> => {
  const source = Axios.CancelToken.source();
  const promise = AXIOS_INSTANCE({
    url,
    method: options?.method,
    headers: options?.headers as any,
    data: options?.body,
    signal: options?.signal as any,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-expect-error - promise cancel
  promise.cancel = () => {
    source.cancel("Query was cancelled");
  };

  return promise;
};

export type ErrorType<Error> = AxiosError<Error>;

export type BodyType<BodyData> = BodyData;
