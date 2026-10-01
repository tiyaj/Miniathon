import dotenv from "dotenv";
import mongoose from "mongoose";
import http from "http";
import app from "../src/app.js";
import { connectDB } from "../src/config/database.js";
import Event from "../src/models/Event.js";
import Zone from "../src/models/Zone.js";
import Shift from "../src/models/Shift.js";
import Role from "../src/models/Role.js";
import Volunteer from "../src/models/Volunteer.js";
import Assignment from "../src/models/Assignment.js";

dotenv.config();

function makeRequest(serverUrl, path, method = "GET", body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, serverUrl);
    const options = {
      method,
      headers: {
        "Content-Type": "application/json"
      }
    };

    const req = http.request(url, options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          resolve({
            status: res.statusCode,
            body: data ? JSON.parse(data) : {}
          });
        } catch {
          resolve({
            status: res.statusCode,
            body: data
          });
        }
      });
    });

    req.on("error", reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runLiveTest() {
  await connectDB();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  const event = await Event.findOne({ name: /PULSE Tech Summit/i });
  if (!event) {
    console.error("No seeded event found in DB");
    server.close();
    process.exit(1);
  }
  console.log("Seeded Event:", event.name, "ID:", event._id.toString());

  const activeAssignment = await Assignment.findOne({
    $or: [{ event: event._id }, { eventId: event._id.toString() }],
    status: { $in: ["assigned", "checked_in"] }
  }).populate("volunteer");

  if (!activeAssignment || !activeAssignment.volunteer) {
    console.error("No active assignment found for seeded event");
    server.close();
    process.exit(1);
  }

  const volId = (activeAssignment.volunteer._id || activeAssignment.volunteer).toString();
  console.log("Volunteer for simulated dropout:", activeAssignment.volunteer.fullName, "ID:", volId);

  // Before snapshot
  const volBefore = await Volunteer.findById(volId).lean();
  const assignBefore = await Assignment.findById(activeAssignment._id).lean();
  const countAssignBefore = await Assignment.countDocuments();
  const countVolBefore = await Volunteer.countDocuments();

  // Make real HTTP simulation request
  const res = await makeRequest(baseUrl, `/api/events/${event._id}/simulate`, "POST", {
    dropoutVolunteerIds: [volId]
  });

  console.log("\n================ LIVE API RESPONSE ================");
  console.log("Status Code:", res.status);
  console.log("Event:", res.body?.data?.event?.name);
  console.log("Simulated Dropouts:", res.body?.data?.simulatedDropouts);
  console.log("Coverage Current:", res.body?.data?.coverage?.current);
  console.log("Coverage Projected:", res.body?.data?.coverage?.projected);
  console.log("Coverage Change:", res.body?.data?.coverage?.change);
  console.log("Affected Areas:", JSON.stringify(res.body?.data?.affectedAreas, null, 2));
  console.log("Replacement Options:", JSON.stringify(res.body?.data?.replacementOptions, null, 2));
  console.log("Recovery Projection:", res.body?.data?.recovery);
  console.log("Resilience Current:", res.body?.data?.resilience?.current);
  console.log("Resilience Projected:", res.body?.data?.resilience?.projected);
  console.log("Resilience Change:", res.body?.data?.resilience?.change);

  // After snapshot
  const volAfter = await Volunteer.findById(volId).lean();
  const assignAfter = await Assignment.findById(activeAssignment._id).lean();
  const countAssignAfter = await Assignment.countDocuments();
  const countVolAfter = await Volunteer.countDocuments();

  console.log("\n================ MONGODB IMMUTABILITY VERIFICATION ================");
  const volStatusMatch = volBefore.status === volAfter.status;
  const volRelMatch = volBefore.reliabilityScore === volAfter.reliabilityScore;
  const assignStatusMatch = assignBefore.status === assignAfter.status;
  const assignVolMatch = String(assignBefore.volunteer || assignBefore.volunteerId) === String(volAfter._id);
  const countAssignMatch = countAssignBefore === countAssignAfter;
  const countVolMatch = countVolBefore === countVolAfter;

  console.log("- Volunteer status unchanged:", volStatusMatch, `(${volBefore.status} === ${volAfter.status})`);
  console.log("- Volunteer reliability unchanged:", volRelMatch, `(${volBefore.reliabilityScore} === ${volAfter.reliabilityScore})`);
  console.log("- Assignment status unchanged:", assignStatusMatch, `(${assignBefore.status} === ${assignAfter.status})`);
  console.log("- Total assignment count unchanged:", countAssignMatch, `(${countAssignBefore} === ${countAssignAfter})`);
  console.log("- Total volunteer count unchanged:", countVolMatch, `(${countVolBefore} === ${countVolAfter})`);

  server.close();
  await mongoose.disconnect();

  if (!volStatusMatch || !volRelMatch || !assignStatusMatch || !countAssignMatch || !countVolMatch) {
    console.error("FATAL: DATABASE WAS MUTATED DURING SIMULATION!");
    process.exit(1);
  }

  console.log("\n>>> LIVE VERIFICATION RESULT: ZERO DATABASE MUTATION. FULL CONTRACT COMPLIANT <<<");
}

runLiveTest().catch(err => {
  console.error("Live test failed:", err);
  process.exit(1);
});
