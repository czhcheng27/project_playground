export type Permission = {
  route: string;
  actions: ("write" | "read")[];
};
