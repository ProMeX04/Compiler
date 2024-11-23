import { useEffect, useState } from 'react';
import { getRuntimes } from '../services/piston';
import { RuntimeVersionMap, PistonRuntime } from '../types/piston';
import { LANGUAGE_CONFIGS } from '../config/languageConfig';

export function usePistonRuntimes() {
  const [runtimeVersions, setRuntimeVersions] = useState<RuntimeVersionMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRuntimes = async () => {
      try {
        const runtimes = await getRuntimes();
        const versionMap: RuntimeVersionMap = {};
        
        runtimes.forEach((runtime: PistonRuntime) => {
          // Handle main language
          if (!versionMap[runtime.language]) {
            versionMap[runtime.language] = [];
          }
          versionMap[runtime.language].push(runtime.version);

          // Handle aliases
          runtime.aliases?.forEach(alias => {
            if (!versionMap[alias]) {
              versionMap[alias] = [];
            }
            versionMap[alias].push(runtime.version);
          });
        });

        setRuntimeVersions(versionMap);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch runtimes'));
        setIsLoading(false);
      }
    };

    fetchRuntimes();
  }, []);

  const getLatestVersion = (language: string): string | undefined => {
    // Try direct language match
    let versions = runtimeVersions[language];

    // If no direct match, try aliases from LANGUAGE_CONFIGS
    if (!versions || versions.length === 0) {
      const aliases = LANGUAGE_CONFIGS[language]?.aliases || [];
      for (const alias of aliases) {
        if (runtimeVersions[alias]?.length > 0) {
          versions = runtimeVersions[alias];
          break;
        }
      }
    }

    if (!versions || versions.length === 0) {
      console.warn(`No runtime versions found for language: ${language}`);
      return undefined;
    }

    // Sort versions and return the latest one
    return versions.sort((a, b) => {
      const aParts = a.split('.').map(Number);
      const bParts = b.split('.').map(Number);
      
      for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const aVal = aParts[i] || 0;
        const bVal = bParts[i] || 0;
        if (aVal !== bVal) return bVal - aVal;
      }
      return 0;
    })[0];
  };

  return {
    runtimeVersions,
    isLoading,
    error,
    getLatestVersion
  };
}