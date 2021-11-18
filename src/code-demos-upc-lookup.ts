export type ProjectEnvironment = {
	UPC_LOOKUP_KV: KVNamespace;
	APPLICATION_NAME: "CodeDemosUpcLookup";
};

export type CtxRequestData = {
	requestDetails: {
		duration: number | undefined;
		publicMessage: string | undefined;
		privateMessage: string | undefined;
		requestId: string;
		start: number | undefined;
		statusCode: number | undefined;
		stop: number | undefined;
	};
	logs: string[];
};
