import { Router, Sunder } from "sunder";

import { ProjectEnvironment } from "./code-demos-upc-lookup";
import { cors, logger, processTimer } from "./middleware";
import { handle404, handleCreateUpc, handleUpcRequest } from "./utils";

const app = new Sunder<ProjectEnvironment>();
const router = new Router<ProjectEnvironment>();

app.use(cors);
app.use(logger);
app.use(processTimer);

router.get("/api/upc/:upc", handleUpcRequest);
router.post("/api/upc", handleCreateUpc);
router.get("*", handle404);
router.post("*", handle404);

app.use(router.middleware);

addEventListener("fetch", (event) => {
	const fe = event as FetchEvent;
	// @ts-ignore
	fe.respondWith(app.handle(fe));
});
