import { useState, useEffect } from "react";
import ForceGraph2D from "../app/ForceGraph2DWrapper";
import { useQuery } from "@apollo/client";
import { GetPkgTypesDocument } from "../gql/__generated__/graphql";
import PackageTypeSelect from "../components/guac/packageTypeSelect";
import PackageNamespaceSelect from "@/components/guac/packageNamespaceSelect";
import PackageNameSelect from "@/components/guac/packageNameSelect";
import PackageVersionSelect from "@/components/guac/packageVersionSelect";
import {
  DataFetcher,
  ParseAndFilterGraph,
  GetNodeById,
} from "@/app/graph_queries";
import { ParseNode } from "../app/ggraph";
import { Toggle } from "@/components/guac/toggleSwitch";
import { useRouter } from "next/router";
import NoSSR from "react-no-ssr";
import React from "react";

export default function Home() {
  let initialPackageNamespaces = [{ label: "loading...", value: "loading" }];
  let packageTypes = initialPackageNamespaces;

  // state management
  const [packageType, setPackageType] = useState("");
  const [packageNamespace, setPackageNamespace] = useState("");
  const [packageName, setPackageName] = useState("");
  const [packageVersion, setPackageVersion] = useState("");
  const [packageNamespaces, setPackageNamespaces] = useState(
    initialPackageNamespaces
  );
  const [packageNames, setPackageNames] = useState(initialPackageNamespaces);
  const [packageVersions, setPackageVersions] = useState(
    initialPackageNamespaces
  );
  const [renderedInitialGraph, setRenderedInitialGraph] = useState(false);

  const [highlightArtifact, setHighlightArtifact] = useState(false);
  const [highlightVuln, setHighlightVuln] = useState(false);
  const [highlightSbom, setHighlightSbom] = useState(false);
  const [highlightBuilder, setHighlightBuilder] = useState(false);

  // this is for the visual graph
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });

  const packageTypesQuery = useQuery(GetPkgTypesDocument, { variables: {} });
  const packageLoading = packageTypesQuery.loading;
  const packageError = packageTypesQuery.error;

  const router = useRouter();

  useEffect(() => {
    console.log(graphData.nodes);
  }, [graphData]);

  const handleArtifactClick = () => {
    setHighlightArtifact(!highlightArtifact);
  };

  const handleVulnClick = () => {
    setHighlightVuln(!highlightVuln);
  };

  const handleSbomClick = () => {
    setHighlightSbom(!highlightSbom);
  };

  const handleBuilderClick = () => {
    setHighlightBuilder(!highlightBuilder);
  };
  // ...

  const resetType = () => {
    setPackageNamespaces(initialPackageNamespaces);
    setPackageNamespace("");
    resetNamespace();
  };

  const resetNamespace = () => {
    setPackageNames(initialPackageNamespaces);
    setPackageName("");
    resetName();
  };

  const resetName = () => {
    setPackageVersions(initialPackageNamespaces);
    setPackageVersion("");
  };

  const localDataFetcher = (id: string) => {
    DataFetcher(id).then((res) => {
      const graphData = { nodes: [], links: [] };
      res.forEach((n) => {
        ParseAndFilterGraph(graphData, ParseNode(n));
      });
      setGraphData(graphData);
    });
  };

  if (!packageError && !packageLoading) {
    // check if any params passed in to visualize, otherwise just go get the package types
    let packageData = packageTypesQuery.data?.packages;
    let sortablePackageData = [...(packageData ?? [])];
    packageTypes = sortablePackageData
      .sort((a, b) => a.type.localeCompare(b.type))
      .map((t) => ({ label: t.type, value: t.type }));

    if (router.query.path != null && !renderedInitialGraph) {
      const nodeIds = router.query.path.split(",");

      const graphData = { nodes: [], links: [] };
      nodeIds.forEach((nodeId) => {
        GetNodeById(nodeId).then((res) => {
          ParseAndFilterGraph(graphData, ParseNode(res.node));
          setGraphData(graphData);
        });
      });
      setRenderedInitialGraph(true);
    }
  }

  return (
    <NoSSR>
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div
          id="ptDiv"
          className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex"
        >
          <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
            <PackageTypeSelect
              label="Package Type"
              options={packageTypes}
              value={packageType}
              setPackageTypeFunc={setPackageType}
              setPackageNamespacesFunc={setPackageNamespaces}
              resetTypeFunc={resetType}
            />
          </div>
          <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
            <PackageNamespaceSelect
              label="Package Namespace"
              options={packageNamespaces}
              value={packageNamespace}
              packageType={packageType}
              setPackageNamespaceFunc={setPackageNamespace}
              setPackageNamesFunc={setPackageNames}
              resetNamespaceFunc={resetName}
            />
          </div>
          <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
            <PackageNameSelect
              label="Package Name"
              options={packageNames}
              value={packageName}
              packageType={packageType}
              packageNamespace={packageNamespace}
              setPackageNameFunc={setPackageName}
              setPackageVersionsFunc={setPackageVersions}
              resetNameFunc={resetName}
            />
          </div>
          <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
            <PackageVersionSelect
              label="Package Version"
              options={packageVersions}
              value={packageVersion}
              packageType={packageType}
              packageNamespace={packageNamespace}
              packageName={packageName}
              setPackageVersionFunc={setPackageVersion}
              setGraphDataFunc={setGraphData}
            />
          </div>
        </div>
        <div className="grid grid-cols-3">
          <div className="w-full items-left justify-left font-mono text-sm p-24 lg:col-span-1">
            <h2 className="my-5">Highlight Nodes</h2>
            <div className="flex flex-col">
              <Toggle
                label="Artifacts"
                toggled={highlightArtifact}
                onClick={() => handleArtifactClick()}
              />
              <Toggle
                label="Vulnerabilities"
                toggled={highlightVuln}
                onClick={() => handleVulnClick()}
              />
              <Toggle
                label="SBOM"
                toggled={highlightSbom}
                onClick={() => handleSbomClick()}
              />
              <Toggle
                label="Builder"
                toggled={highlightBuilder}
                onClick={() => handleBuilderClick()}
              />
            </div>
          </div>
          <div className="lg:col-span-2">
            <ForceGraph2D
              graphData={graphData}
              nodeLabel={"label"}
              linkDirectionalArrowLength={3}
              linkDirectionalArrowRelPos={3}
              linkDirectionalParticles={0}
              dataFetcher={localDataFetcher}
              onNodeDragEnd={(node) => {
                node.fx = node.x;
                node.fy = node.y;
              }}
              nodeCanvasObject={(node, ctx) => {
                const shapeSize = 10; // set a constant size for each shape

                const applyRedFillAndOutline =
                  (highlightArtifact && node.type === "Artifact") ||
                  (highlightVuln && node.type === "CertifyVuln") ||
                  (highlightSbom && node.type === "IsDependency") ||
                  (highlightBuilder && node.type === "PackageType");

                switch (node.type) {
                  case "PackageType":
                    ctx.fillStyle = applyRedFillAndOutline
                      ? "red"
                      : "light blue";
                    ctx.fillRect(node.x - 6, node.y - 4, 12, 8);
                    break;
                  case "IsDependency":
                    ctx.fillStyle = applyRedFillAndOutline ? "red" : "pink";
                    ctx.beginPath();
                    ctx.moveTo(node.x, node.y - shapeSize / 2);
                    ctx.lineTo(node.x - shapeSize / 2, node.y + shapeSize / 2);
                    ctx.lineTo(node.x + shapeSize / 2, node.y + shapeSize / 2);
                    ctx.fill();
                    break;
                  case "CertifyVuln":
                    ctx.fillStyle = applyRedFillAndOutline ? "red" : "orange";
                    const sideLength =
                      shapeSize / Math.sqrt(3.5 - 1.5 * Math.cos(Math.PI / 4));
                    ctx.beginPath();
                    ctx.moveTo(node.x + sideLength, node.y);
                    ctx.lineTo(
                      node.x + sideLength / 2,
                      node.y - sideLength / 2
                    );
                    ctx.lineTo(
                      node.x - sideLength / 2,
                      node.y - sideLength / 2
                    );
                    ctx.lineTo(node.x - sideLength, node.y);
                    ctx.lineTo(
                      node.x - sideLength / 2,
                      node.y + sideLength / 2
                    );
                    ctx.lineTo(
                      node.x + sideLength / 2,
                      node.y + sideLength / 2
                    );
                    ctx.closePath();
                    ctx.fill();
                    break;
                  case "PackageVersion":
                    ctx.fillStyle = applyRedFillAndOutline ? "red" : "orange";
                    var side = 10;
                    ctx.fillRect(
                      node.x - side / 2,
                      node.y - side / 2,
                      side,
                      side
                    );
                    break;
                  case "NoVuln":
                    ctx.fillStyle = applyRedFillAndOutline ? "red" : "green";
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
                    ctx.fill();
                    break;
                  case "Artifact":
                    ctx.strokeStyle = "red";
                    ctx.fillStyle = applyRedFillAndOutline ? "red" : "yellow";
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, shapeSize / 2, 0, 2 * Math.PI);
                    ctx.stroke();
                    ctx.fill();
                    console.log("Testing if artifact is getting populated");
                    break;
                  default:
                    ctx.fillStyle = applyRedFillAndOutline ? "red" : "blue";
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
                    ctx.fill();
                    break;
                }
                // label the node with text, a little bit under the shape
                ctx.fillText(node.label, node.x, node.y + 12);
              }}
            />
          </div>
        </div>
      </main>
    </NoSSR>
  );
}
