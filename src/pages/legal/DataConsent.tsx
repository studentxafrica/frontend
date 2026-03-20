import DataConsentHtml from "./data_consent.html?raw";
const DataConsent = () => {
	return (
		<div className="p-4" dangerouslySetInnerHTML={{ __html: DataConsentHtml }} />
	)

}

export default DataConsent;
