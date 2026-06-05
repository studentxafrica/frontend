import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUpRight, BriefcaseBusiness, Megaphone, RefreshCcw, ShieldCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import axiosInstance from "@/api/axios";

type StudentBusinessPromotion = {
  enabled?: boolean;
  title?: string;
  description?: string;
  ctaLabel?: string;
};

type MissingRequirement = {
  field: string;
  label: string;
  message: string;
};

type ApplicationStatus = "pending" | "requested" | "approved" | "rejected";

type StudentBusinessApplication = {
  id: string;
  status: ApplicationStatus;
  businessName: string;
  businessType: string;
  reviewFeedback?: string;
  submittedAt?: string;
  reviewedAt?: string;
};

type EligibilityData = {
  eligible: boolean;
  missingRequirements: MissingRequirement[];
  latestApplication?: StudentBusinessApplication | null;
};

interface StudentBusinessPromoProps {
  promotion?: StudentBusinessPromotion;
}

const DEFAULT_PROMOTION: Required<StudentBusinessPromotion> = {
  enabled: true,
  title: "Turn your hustle into a student-owned brand",
  description: "Apply to list your products or freelance services on StudentX.",
  ctaLabel: "Apply to Join",
};

const statusStyles: Record<ApplicationStatus, string> = {
  pending: "bg-amber-100 text-amber-900",
  requested: "bg-blue-100 text-blue-900",
  approved: "bg-green-100 text-green-900",
  rejected: "bg-red-100 text-red-900",
};

export const StudentBusinessPromo = ({ promotion }: StudentBusinessPromoProps) => {
  const [eligibilityData, setEligibilityData] = useState<EligibilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ownershipFiles, setOwnershipFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    businessDescription: "",
    businessEmail: "",
    businessPhone: "",
    website: "",
    registrationNumber: "",
    additionalNotes: "",
  });

  const promo = {
    ...DEFAULT_PROMOTION,
    ...(promotion || {}),
  };

  const latestApplication = eligibilityData?.latestApplication || null;
  const canSubmitApplication = useMemo(() => {
    if (!eligibilityData?.eligible) {
      return false;
    }
    if (!latestApplication) {
      return true;
    }
    return ["requested", "rejected"].includes(latestApplication.status);
  }, [eligibilityData?.eligible, latestApplication]);

  const loadEligibility = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/user/student-business-application/eligibility");
      setEligibilityData(response.data?.data || null);
    } catch (error: any) {
      toast({
        title: "Failed to load application status",
        description: error.response?.data?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (promotion && promotion.enabled === false) {
      setLoading(false);
      return;
    }
    loadEligibility();
  }, [promotion]);

  const handleSubmit = async () => {
    if (!formData.businessName || !formData.businessType || !formData.businessDescription) {
      toast({
        title: "Missing required fields",
        description: "Business name, type, and description are required.",
        variant: "destructive",
      });
      return;
    }
    if (ownershipFiles.length === 0) {
      toast({
        title: "Ownership document required",
        description: "Upload at least one ownership proof document.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const payload = new FormData();
      payload.append("businessName", formData.businessName);
      payload.append("businessType", formData.businessType);
      payload.append("businessDescription", formData.businessDescription);
      payload.append("businessEmail", formData.businessEmail);
      payload.append("businessPhone", formData.businessPhone);
      payload.append("website", formData.website);
      payload.append("registrationNumber", formData.registrationNumber);
      payload.append("additionalNotes", formData.additionalNotes);
      payload.append("documentsMeta", JSON.stringify(
        ownershipFiles.map((file) => ({
          name: file.name,
          type: "ownership_proof",
          size: file.size,
        }))
      ));
      ownershipFiles.forEach((file) => payload.append("ownershipDocuments", file));

      await axiosInstance.post("/user/student-business-applications", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast({
        title: "Application submitted",
        description: "Your student-owned business application is now under review.",
      });
      setIsApplyOpen(false);
      setOwnershipFiles([]);
      setFormData({
        businessName: "",
        businessType: "",
        businessDescription: "",
        businessEmail: "",
        businessPhone: "",
        website: "",
        registrationNumber: "",
        additionalNotes: "",
      });
      await loadEligibility();
    } catch (error: any) {
      toast({
        title: "Submission failed",
        description: error.response?.data?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (promotion && promotion.enabled === false) {
    return null;
  }

  return (
    <>
      <Card className="border-0 shadow-sm overflow-hidden bg-linear-to-r from-amber-100 via-orange-50 to-white">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col gap-5">
            <div>
              <Badge className="bg-amber-900 text-white hover:bg-amber-900 border-0 mb-3">
                <Megaphone className="h-4 w-4 mr-1.5" />
                Student-Owned Program
              </Badge>
              <h3 className="text-xl md:text-2xl font-bold text-amber-950 flex items-center gap-2">
                <BriefcaseBusiness className="h-5 w-5" />
                {promo.title}
              </h3>
              <p className="text-amber-900/90 mt-2 max-w-2xl">{promo.description}</p>
            </div>

            {loading ? (
              <p className="text-sm text-amber-900/80">Checking your eligibility...</p>
            ) : (
              <div className="space-y-3">
                {latestApplication && (
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={`${statusStyles[latestApplication.status]} border-0`}>
                      Application {latestApplication.status}
                    </Badge>
                    {latestApplication.reviewFeedback && (
                      <span className="text-sm text-amber-950/90">
                        Feedback: {latestApplication.reviewFeedback}
                      </span>
                    )}
                  </div>
                )}

                {!eligibilityData?.eligible && (
                  <div className="bg-white/70 border border-amber-200 rounded-md p-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-amber-900">
                      <ShieldCheck className="h-4 w-4" />
                      Complete these requirements first:
                    </div>
                    <ul className="list-disc pl-5 text-sm text-amber-900/90 mt-1">
                      {eligibilityData?.missingRequirements?.map((req) => (
                        <li key={req.field}>{req.message}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button
                    className="bg-amber-900 hover:bg-amber-800 text-white"
                    disabled={!canSubmitApplication}
                    onClick={() => setIsApplyOpen(true)}
                  >
                    {latestApplication && ["requested", "rejected"].includes(latestApplication.status)
                      ? "Submit Updated Application"
                      : promo.ctaLabel}
                    <ArrowUpRight className="h-4 w-4 ml-2" />
                  </Button>

                  <Button variant="outline" onClick={loadEligibility}>
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Refresh Status
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student-Owned Business Application</DialogTitle>
            <DialogDescription>
              Share your business details and upload proof of ownership for review.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              placeholder="Business name *"
              value={formData.businessName}
              onChange={(e) => setFormData((prev) => ({ ...prev, businessName: e.target.value }))}
            />
            <Input
              placeholder="Business type (e.g. Design Services, Bakery) *"
              value={formData.businessType}
              onChange={(e) => setFormData((prev) => ({ ...prev, businessType: e.target.value }))}
            />
            <Textarea
              placeholder="Business description *"
              value={formData.businessDescription}
              onChange={(e) => setFormData((prev) => ({ ...prev, businessDescription: e.target.value }))}
            />
            <Input
              placeholder="Business contact email"
              value={formData.businessEmail}
              onChange={(e) => setFormData((prev) => ({ ...prev, businessEmail: e.target.value }))}
            />
            <Input
              placeholder="Business contact phone"
              value={formData.businessPhone}
              onChange={(e) => setFormData((prev) => ({ ...prev, businessPhone: e.target.value }))}
            />
            <Input
              placeholder="Website (optional)"
              value={formData.website}
              onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
            />
            <Input
              placeholder="Registration number (optional)"
              value={formData.registrationNumber}
              onChange={(e) => setFormData((prev) => ({ ...prev, registrationNumber: e.target.value }))}
            />
            <Textarea
              placeholder="Additional notes"
              value={formData.additionalNotes}
              onChange={(e) => setFormData((prev) => ({ ...prev, additionalNotes: e.target.value }))}
            />
            <div className="space-y-2">
              <label className="text-sm font-medium">Documents for proof of ownership *</label>
              <Input
                type="file"
                multiple
                onChange={(e) => setOwnershipFiles(Array.from(e.target.files || []))}
              />
              {ownershipFiles.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {ownershipFiles.length} file(s) selected
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApplyOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
