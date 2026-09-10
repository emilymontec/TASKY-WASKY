import type { WrappedSlide } from "@/lib/wrapped/types";
import { OpeningSlide } from "@/components/wrapped/slides/OpeningSlide";
import { VolumeSlide } from "@/components/wrapped/slides/VolumeSlide";
import { RhythmSlide } from "@/components/wrapped/slides/RhythmSlide";
import { LanguagesSlide } from "@/components/wrapped/slides/LanguagesSlide";
import { ReposSlide } from "@/components/wrapped/slides/ReposSlide";
import { StreakSlide } from "@/components/wrapped/slides/StreakSlide";
import { ClosingSlide } from "@/components/wrapped/slides/ClosingSlide";

function assertNever(value: never): never {
  throw new Error(`Slide kind sin renderer: ${JSON.stringify(value)}`);
}

export function SlideRenderer({ slide }: { slide: WrappedSlide }) {
  switch (slide.kind) {
    case "opening":
      return <OpeningSlide data={slide.data} />;
    case "volume":
      return <VolumeSlide data={slide.data} />;
    case "rhythm":
      return <RhythmSlide data={slide.data} />;
    case "languages":
      return <LanguagesSlide data={slide.data} />;
    case "repos":
      return <ReposSlide data={slide.data} />;
    case "streak":
      return <StreakSlide data={slide.data} />;
    case "closing":
      return <ClosingSlide data={slide.data} />;
    default:
      return assertNever(slide);
  }
}
