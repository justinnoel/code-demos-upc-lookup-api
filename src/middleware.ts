import { ulid } from "ulidx";

import { CtxRequestData } from "./code-demos-upc-lookup";
export const cors = async (ctx, next) => {
	await next();
	// IMPORTANT: Change this to only allow valid URLs for production
	ctx.response.set("Access-Control-Allow-Origin", "*");
	ctx.response.set("Access-Control-Allow-Methods", "OPTION,GET,POST");
	ctx.response.set("Access-Control-Max-Age", "1728000");
	ctx.response.set("Access-Control-Allow-Headers", [
		"Origin",
		"X-Requested-With",
		"content-type",
		"Accept",
	]);
};

export const logger = async (ctx, next) => {
	const requestUlid = ulid();
	ctx.response.set("X-Request-Id", requestUlid);
	ctx.data.logs = [];
	ctx.data.requestDetails = {
		duration: undefined,
		publicMessage: undefined,
		privateMessage: undefined,
		requestId: requestUlid,
		start: undefined,
		statusCode: undefined,
		stop: undefined,
	} as CtxRequestData["requestDetails"];

	await next();

	const status = ctx.response.status;
	const { start, duration, privateMessage } = ctx.data.requestDetails;
	const statusToLog = status === 200 ? "OK" : privateMessage;

	console.log(
		`${requestUlid} : ${start} : ${ctx.request.method} ${
			ctx.url
		} - ${duration} : ${status} : ${statusToLog || ""}`,
	);

	ctx.data.logs.forEach((log, index) => {
		console.log(`${requestUlid} : log ${index} : ${log}`);
	});
};

export const processTimer = async (ctx, next) => {
	ctx.data.requestDetails.start = Date.now();

	await next();

	ctx.data.requestDetails.stop = Date.now();
	ctx.data.requestDetails.duration =
		ctx.data.requestDetails.stop - ctx.data.requestDetails.start;
};
