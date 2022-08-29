// eslint-disable-next-line @typescript-eslint/no-var-requires
const axios = require('axios').default;

/**
 * Class for Running node fetch.
 * Simple wrapper for Dependency Injection testing.
 */
export class AxiosService {
  async get<T>(url: string, reqInfo: any): Promise<T> {
    const response = await axios.get(url, reqInfo);
    return response.data as T;
  }
}
