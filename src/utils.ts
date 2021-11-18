type UPC_DATA = {
	brand: string;
	manufacturer: string;
	mpn: string;
	title: string;
	weight: string;
	upc: string;
};

export function handleError({ data, error, response }) {
	if (error?.message?.includes(`"isHandled":true`)) {
		const { statusCode, publicMessage, privateMessage } = JSON.parse(
			error.message,
		);

		response.status = statusCode;
		response.body = publicMessage;
		data.requestDetails.privateMessage = privateMessage;
		return response;
	}

	// If the API didn't expect this message and handled it, throw for the
	// Sunders library to deal with it.
	throw Error;
}

export async function handleUpcRequest({ data, response, params }) {
	try {
		const upc = params.upc;
		const upcData = await getUpcInfo(upc);
		if (!upcData) {
			const errorInfo = JSON.stringify({
				isHandled: true,
				privateMessage: `Not Found : upc : '${upc?.substring(
					0,
					50,
				)}' : upc length : ${upc?.length}`,
				publicMessage: "Not Found",
				statusCode: 404,
			});

			throw new Error(errorInfo);
		}

		response.status = 200;

		// Sunder automatically stringifies and sends `content-type: application/json`
		response.body = {
			status: "success",
			data: { ...upcData },
		};

		return;
	} catch (error) {
		handleError({ data, error, response });
	}
}

export async function handleCreateUpc({ data, request, response }) {
	try {
		const requestJson = await getJson({
			request,
			invalidTypeMessage: "Bad Request - Invalid Content Type",
			invalidJsonMessage: "Bad Request - Invalid Content",
		});

		await saveUpc(requestJson);
		response.status = 200;
		response.body = JSON.stringify({
			status: "success",
		});

		return;
	} catch (error) {
		handleError({ data, error, response });
	}
}

export function getContentType(request: Request): string {
	const headers = request.headers;
	return headers.get("content-type");
}

export async function getUpcInfo(upc: string): Promise<UPC_DATA | null> {
	const data: UPC_DATA | null = await UPC_LOOKUP_KV.get(upc, {
		type: "json",
	});

	return data;
}

export function handle404({ response }) {
	response.status = 404;
	response.body = "Not Found";
}

export async function getJson({
	request,
	invalidTypeMessage,
	invalidJsonMessage,
}) {
	const contentType = getContentType(request) || "";

	if (!contentType.includes("application/json")) {
		const errorInfo = JSON.stringify({
			isHandled: true,
			privateMessage: `${invalidTypeMessage} : Content-Type : ${contentType?.substring(
				0,
				50,
			)}`,
			publicMessage: invalidTypeMessage,
			statusCode: 400,
		});

		throw new Error(errorInfo);
	}

	const requestJson = await request.json();

	if (!requestJson) {
		const errorInfo = JSON.stringify({
			isHandled: true,
			privateMessage: invalidJsonMessage,
			publicMessage: invalidJsonMessage,
			statusCode: 400,
		});

		throw new Error(errorInfo);
	}

	return requestJson;
}

export async function saveUpc(details): Promise<void> {
	const { upc } = details;

	await UPC_LOOKUP_KV.put(upc, JSON.stringify(details));
}
