/**
 * @swagger
 * /api/client/bu/department/editDepartment:
 *   put:
 *     summary: Edit an existing department
 *     description: Updates the details of an existing department based on the provided `deptId` and `clientId`. Creates a new department if it doesn't exist (`upsert` operation).
 *     tags:
 *       - Department
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             clientId: "6735e64c5c58f271b1ce1678"
 *             deptId: "6746af38b193ebcde50803fd"
 *             branchId: "6736e43eecc4dfe280f90d03"
 *             deptName: "Human Resources"
 *             description: "Updated description for the department."
 *             
 *     responses:
 *       200:
 *         description: Department updated successfully or no changes made.
 *         content:
 *           application/json:
 *             examples:
 *               DepartmentCreated:
 *                 summary: Department created via upsert.
 *                 value:
 *                   status: true
 *                   message: "Department created successfully."
 *                   clientId: "6735e64c5c58f271b1ce1678"
 *                   deptId: "673c56bac071b7a57c121d2f"
 *                   branchId: "6736e43eecc4dfe280f90d03"
 *                   deptName: "Human Resources"
 *                   description: "Updated description for the department."
 *                  
 *               DepartmentModified:
 *                 summary: Department details updated.
 *                 value:
 *                   status: true
 *                   message: "Department modified successfully."
 *                   clientId: "6735e64c5c58f271b1ce1678"
 *                   deptId: "673c56bac071b7a57c121d2f"
 *                   branchId: "6736e43eecc4dfe280f90d03"
 *                   deptName: "Human Resources"
 *                   description: "Updated description for the department."
 *                   isActive: true
 *               NoChanges:
 *                 summary: No changes were made to the department.
 *                 value:
 *                   status: true
 *                   message: "No changes were made."
 *       400:
 *         description: Missing required fields like `clientId` or `deptId` or validation errors.
 *         content:
 *           application/json:
 *             example:
 *               status: false
 *               message: "Credential missing."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               status: false
 *               message: "Internal server error."
 */
