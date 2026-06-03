import { useActiveSponsors } from "@/hooks/useSponsors";

/** Advertising banner shown on the voting pages (gallery / leaderboard). */
const SponsorBanner = ({ className = "" }: { className?: string }) => {
  const { data: sponsors = [] } = useActiveSponsors();

  const banner =
    sponsors.find((s) => s.placement === "voting" && (s.banner_url || s.logo_url)) ||
    sponsors.find((s) => s.featured && (s.banner_url || s.logo_url));
  if (!banner) return null;

  const image = banner.banner_url || banner.logo_url!;
  const Wrapper: any = banner.link_url ? "a" : "div";
  const wrapperProps = banner.link_url
    ? { href: banner.link_url, target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <Wrapper {...wrapperProps}
      className={`block bg-card rounded-2xl border border-border overflow-hidden shadow-soft ${banner.link_url ? "hover:border-primary/40 transition-colors cursor-pointer" : ""} ${className}`}>
      <div className="flex items-center gap-4 p-4">
        <div className="w-28 h-16 shrink-0 bg-white rounded-lg border border-border flex items-center justify-center p-2">
          <img src={image} alt={banner.title} className="max-w-full max-h-full object-contain" loading="lazy" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Partner súťaže</p>
          <p className="font-bold text-foreground truncate">{banner.banner_text || banner.title}</p>
          {banner.description && <p className="text-sm text-muted-foreground truncate">{banner.description}</p>}
        </div>
      </div>
    </Wrapper>
  );
};

export default SponsorBanner;
