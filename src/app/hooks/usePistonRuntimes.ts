import { useQuery } from "@tanstack/react-query";
import { getRuntimes } from "../services/piston";
import { PistonRuntime, RuntimeVersionMap } from "../types/piston";
import { LANGUAGE_CONFIGS } from "../config/languagesConfig/categories";

const buildRuntimeVersionMap = (
  runtimes: PistonRuntime[]
): RuntimeVersionMap => {
  const versionMap: RuntimeVersionMap = {};

  runtimes.forEach((runtime) => {
    if (!versionMap[runtime.language]) {
      versionMap[runtime.language] = [];
    }
    versionMap[runtime.language].push(runtime.version);

    runtime.aliases?.forEach((alias: string) => {
      if (!versionMap[alias]) {
        versionMap[alias] = [];
      }
      versionMap[alias].push(runtime.version);
    });
  });

  return versionMap;
};

export function usePistonRuntimes() {
  const {
    data: runtimeVersions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["piston-runtimes"],
    queryFn: async () => {
      const runtimes = await getRuntimes();
      const versionMap = buildRuntimeVersionMap(runtimes);
      return versionMap;
    },
    // Remove initialData and enabled since they're causing issues
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 2, // Add retry logic
    refetchOnMount: true, // Ensure it fetches on first mount
  });

  const getLatestVersion = (language: string): string | undefined => {
    // Add safety check for undefined runtimeVersions
    if (!runtimeVersions || Object.keys(runtimeVersions).length === 0) {
      console.warn("No runtime versions available");
      return undefined;
    }

    const languageIds = [
      language,
      ...(LANGUAGE_CONFIGS[language]?.aliases || []),
    ];
    for (const langId of languageIds) {
      const versions = runtimeVersions[langId];
      if (versions?.length > 0) {
        return versions.sort((a, b) => {
          const aParts = a.split(".").map(Number);
          const bParts = b.split(".").map(Number);

          for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
            const aVal = aParts[i] || 0;
            const bVal = bParts[i] || 0;
            if (aVal !== bVal) return bVal - aVal;
          }
          return 0;
        })[0];
      }
    }

    console.warn(`No runtime versions found for language: ${language}`);
    return undefined;
  };

  return {
    runtimeVersions: runtimeVersions || {},
    isLoading,
    error,
    getLatestVersion,
  };
}
