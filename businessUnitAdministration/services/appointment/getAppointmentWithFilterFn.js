const { getClientDatabaseConnection } = require("../../../db/connection");
const appointmentSchema = require("../../../client/model/appointments");
const clinetChairSchema = require("../../../client/model/chair");
const clinetBusinessUnitSchema = require("../../../client/model/businessUnit");
const clinetBranchSchema = require("../../../client/model/branch");
const caseSheetSchema = require("../../../client/model/caseSheet");
const clinetUserSchema = require("../../../client/model/user");
const clinetPatientSchema = require("../../../client/model/patient");
const { formatAppointment } = require("../../../utils/helperFunctions");

const getAppointmentWithFilterFn = async ({ page = null, perPage = null, searchKey, appointmentId, fromDate, toDate, buId, branchId, dutyDoctorId, specialistDoctorId, dentalAssistant, patientId, caseSheetId, caseId, createdUser, updatedUser, clientId }) => {
    try {
        const db = await getClientDatabaseConnection(clientId);
        const Appointment = await db.model('Appointment', appointmentSchema);
        //, clinetBusinessUnitSchema, clinetBranchSchema, clinetUserSchema

        //these are user for populating the data
        const businessUnit = await db.model("businessUnit", clinetBusinessUnitSchema);
        const branch = await db.model("branch", clinetBranchSchema);
        const caseSheet = db.model('caseSheet', caseSheetSchema);
        const user = await db.model("clientUsers", clinetUserSchema);
        const patient = db.model('patient', clinetPatientSchema);
        const chair = await db.model("chair", clinetChairSchema);


        if (appointmentId) {
            const specificAppointment = await Appointment.findOne({ _id: appointmentId, deletedAt: null })
                .populate("buId", "_id name")
                .populate("branchId", "_id name")
                .populate("dutyDoctorId", "_id firstName lastName")
                .populate("specialistDoctorId", "_id firstName lastName")
                .populate("patientId", "_id firstName lastName")
                .populate("caseSheetId", "_id displayId")
                .populate("chairId", "_id chairNumber")
                .populate("caseId", "_id displayId")
                .populate("createdBy", "_id firstName lastName")
                .populate("updatedBy", "_id firstName lastName")
                .populate("deletedBy", "_id firstName lastName")
                .lean();

            if (!specificAppointment) {
                return { status: false, message: "Appointment not found" };
            }

            const formattedAppointment = formatAppointment(specificAppointment);

            return {
                status: true,
                message: "The Appointment retrieved successfully.",
                data: {
                    appointments: formattedAppointment,
                    metadata: {
                        page: 1,
                        perPage: 1,
                        totalCount: 1,
                        totalPages: 1
                    },
                },
            };
        };

        let searchQuery = {};
        if (searchKey) {
            if (searchKey.trim()) {
                const words = searchKey.trim().split(/\s+/)
                    .map(word =>
                        word.replace(/[.*+?^${}|[\]\\]/g, '\\$&').trim()
                    );
                //const escapedSearchKey = searchKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                searchQuery = {
                    $or: words.flatMap(word => [
                        { displayId: { $regex: word, $options: "i" } },
                        { status: { $regex: word, $options: "i" } },
                        { chiefComplaint: { $regex: word, $options: "i" } },

                    ]),
                };
            };
        };

        // Apply filters only if parameters exist
        const businessSearchKey = buId ? { buId } : {};
        const branchIdSearchKey = branchId ? { branchId } : {};
        const dutyDoctorIdSearchKey = dutyDoctorId ? { dutyDoctorId } : {};
        const specialistDoctorIdSearchKey = specialistDoctorId ? { specialistDoctorId } : {};
        const patientIdSearchKey = patientId ? { patientId } : {};
        const dentalAssistantIdSearchKey = dentalAssistant ? { dentalAssistant } : {};
        const caseSheetIdSearchKey = caseSheetId ? { caseSheetId } : {};
        const caseIdSearchKey = caseId ? { caseId } : {};
        const createdUserSearchKey = createdUser ? { createdBy: createdUser } : {};
        const updatedUserSearchKey = updatedUser ? { updatedBy: updatedUser } : {};
        //const deletedUserSearchKey = deletedUser ? { deletedBy: deletedUser } : {};


        // Apply date filters
        let dateSearchKey = {};
        if (fromDate || toDate) {
            dateSearchKey = { createdAt: {} };
            if (fromDate) dateSearchKey.createdAt.$gte = new Date(fromDate);
            if (toDate) dateSearchKey.createdAt.$lte = new Date(toDate);
        }


        // if (slotFrom || slotTo) {
        //     dateSearchKey = { createdAt: {} };
        //     if (slotFrom) dateSearchKey.createdAt.$gte = new Date(slotFrom);
        //     if (slotTo) dateSearchKey.createdAt.$lte = new Date(slotTo);
        // }


        if (!page || !perPage) {
            const allAppointment = await Appointment.find({
                ...searchQuery,
                ...businessSearchKey,
                ...branchIdSearchKey,
                ...dutyDoctorIdSearchKey,
                ...specialistDoctorIdSearchKey,
                ...patientIdSearchKey,
                ...dentalAssistantIdSearchKey,
                ...caseSheetIdSearchKey,
                ...caseIdSearchKey,
                ...createdUserSearchKey,
                ...updatedUserSearchKey,
                deletedAt: null,
            })
                .populate("buId", "_id name")
                .populate("branchId", "_id name")
                .populate("dutyDoctorId", "_id firstName lastName")
                .populate("specialistDoctorId", "_id firstName lastName")
                .populate("patientId", "_id firstName lastName")
                .populate("caseSheetId", "_id displayId")
                .populate("chairId", "_id chairNumber")
                .populate("caseId", "_id displayId")
                .populate("createdBy", "_id firstName lastName")
                .populate("updatedBy", "_id firstName lastName")
                .populate("deletedBy", "_id firstName lastName")
                .lean();


            const formattedAppointment = allAppointment.map((appointment) => formatAppointment(appointment));
            return {
                status: true,
                message: "All Appointment retrieved successfully.",
                data: {
                    appointments: formattedAppointment,
                    metadata: {
                        page: 1,
                        perPage: allAppointment?.length,
                        totalCount: allAppointment?.length,
                        totalPages: 1
                    },
                },
            };
        };


        // Query the database
        let query = Appointment.find({
            ...searchQuery,
            ...businessSearchKey,
            ...branchIdSearchKey,
            ...dutyDoctorIdSearchKey,
            ...specialistDoctorIdSearchKey,
            ...patientIdSearchKey,
            ...dentalAssistantIdSearchKey,
            ...caseSheetIdSearchKey,
            ...caseIdSearchKey,
            ...createdUserSearchKey,
            ...updatedUserSearchKey,
            deletedAt: null,
        })
            .populate("buId", "_id name")
            .populate("branchId", "_id name")
            .populate("dutyDoctorId", "_id firstName lastName")
            .populate("specialistDoctorId", "_id firstName lastName")
            .populate("patientId", "_id firstName lastName")
            .populate("caseSheetId", "_id displayId")
            .populate("chairId", "_id chairNumber")
            .populate("caseId", "_id displayId")
            .populate("createdBy", "_id firstName lastName")
            .populate("updatedBy", "_id firstName lastName")
            .populate("deletedBy", "_id firstName lastName")
            .lean();


        // Apply pagination only if page & perPage are provided
        page = Number(page) || 1;
        perPage = Number(perPage) || 10;

        const skip = (page - 1) * perPage;

        // Fetch data
        const appointments = await query.skip(skip).limit(perPage);


        const formattedAppointments = appointments.map((appointment) => formatAppointment(appointment));

        // Get total count properly
        const totalCount = await Appointment.countDocuments({
            ...searchQuery,
            ...businessSearchKey,
            ...branchIdSearchKey,
            ...dutyDoctorIdSearchKey,
            ...specialistDoctorIdSearchKey,
            ...patientIdSearchKey,
            ...dentalAssistantIdSearchKey,
            ...caseSheetIdSearchKey,
            ...caseIdSearchKey,
            ...createdUserSearchKey,
            ...updatedUserSearchKey,
            deletedAt: null,
        });

        // Calculate total pages
        const totalPages = Math.ceil(totalCount / perPage);

        return {
            status: true,
            message: totalCount < 1 ? "No Appointments found" : "Appointment details retrieved successfully.",
            data: {
                appointments: formattedAppointments,
                metadata: {
                    page,
                    perPage,
                    totalCount,
                    totalPages,
                },
            },
        };
        //return { status: true, data: result };

    } catch (error) {
        return { status: false, message: error.message };
    }
}

module.exports = getAppointmentWithFilterFn;