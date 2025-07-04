// 管理 token 刷新期间的请求队列
let queue: ((token: string) => void)[] = [];
let refreshing = false;

export function addPendingRequest(cb: (token: string) => void) {
  queue.push(cb);
}

export function runPendingRequest(token: string) {
  queue.forEach((cb) => cb(token));
  queue = [];
}

export function isRefreshing() {
  return refreshing;
}

export function setRefreshing(value: boolean) {
  refreshing = value;
}
