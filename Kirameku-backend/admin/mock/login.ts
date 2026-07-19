import { defineFakeRoute } from "vite-plugin-fake-server/client";

export default defineFakeRoute([
  {
    url: "/login",
    method: "post",
    response: () => ({
      code: 10001,
      message: "模拟登录已禁用，请使用后端创建的管理员账号",
      data: null
    })
  }
]);
