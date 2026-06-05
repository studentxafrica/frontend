import PrivacyPolicyHtml from "./privacy.html?raw";
const PrivacyPolicy = () => {
	return (
		<div className="p-4" dangerouslySetInnerHTML={{ __html: PrivacyPolicyHtml }} />
	)

}

export default PrivacyPolicy;
