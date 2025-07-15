// utils/courseMetadata.js
// Simple mapping of courses to your Pinata metadata CIDs

export const COURSE_METADATA_CIDS = {
  1: "bafkreiedgadukef2en6hziehpwmlxp4nb2i7vltd6vdqt2hpjwilj5kkqi", // Course 1 (Beginner)
  2: "bafkreidxyjgqrhnhkiotjkdeonohtv4lfgx7ymx5g6agryhjkqom3g7zpq", // Course 2 (Intermediate)  
  3: "bafkreidef3rmzgv7wrp7m4pdcpcqpwz65cvxdqu5qcfhawxxthde7gqs3q"  // Course 3 (Advanced)
};

// Get metadata CID for a course
export const getMetadataCID = (courseId) => {
  return COURSE_METADATA_CIDS[courseId] || null;
};

// Generate IPFS URI for course metadata
export const getTokenURI = (courseId) => {
  const cid = getMetadataCID(courseId);
  return cid ? `ipfs://${cid}` : null;
};

// Generate Pinata gateway URL for metadata
export const getMetadataURL = (courseId) => {
  const cid = getMetadataCID(courseId);
  return cid ? `https://gateway.pinata.cloud/ipfs/${cid}` : null;
};