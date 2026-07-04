import { Redirect } from "expo-router";

const ROUTE_LOGIN = "/login" as const;

export default function IndexScreen() {
  return <Redirect href={ROUTE_LOGIN} />;
}
