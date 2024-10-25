using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aibidia.Homework.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class CreateJobPositionsAndQuestions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Name",
                schema: "dbo",
                table: "Resume",
                newName: "ResumeFilePath");

            migrationBuilder.AddColumn<bool>(
                name: "AllowDataProcessing",
                schema: "dbo",
                table: "Resume",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Email",
                schema: "dbo",
                table: "Resume",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "FirstName",
                schema: "dbo",
                table: "Resume",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "JobPositionId",
                schema: "dbo",
                table: "Resume",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "LastName",
                schema: "dbo",
                table: "Resume",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "LinkedInUrl",
                schema: "dbo",
                table: "Resume",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Phone",
                schema: "dbo",
                table: "Resume",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "JobPosition",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Location = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Department = table.Column<int>(type: "int", nullable: false),
                    EmploymentType = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JobPosition", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Question",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Text = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Question", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "JobPositionQuestions",
                schema: "dbo",
                columns: table => new
                {
                    JobPositionId = table.Column<int>(type: "int", nullable: false),
                    QuestionsId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JobPositionQuestions", x => new { x.JobPositionId, x.QuestionsId });
                    table.ForeignKey(
                        name: "FK_JobPositionQuestions_JobPosition_JobPositionId",
                        column: x => x.JobPositionId,
                        principalSchema: "dbo",
                        principalTable: "JobPosition",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_JobPositionQuestions_Question_QuestionsId",
                        column: x => x.QuestionsId,
                        principalSchema: "dbo",
                        principalTable: "Question",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "QuestionAnswer",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Answer = table.Column<bool>(type: "bit", nullable: false),
                    ResumeId = table.Column<int>(type: "int", nullable: false),
                    QuestionId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuestionAnswer", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuestionAnswer_Question_QuestionId",
                        column: x => x.QuestionId,
                        principalSchema: "dbo",
                        principalTable: "Question",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_QuestionAnswer_Resume_ResumeId",
                        column: x => x.ResumeId,
                        principalSchema: "dbo",
                        principalTable: "Resume",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Resume_JobPositionId",
                schema: "dbo",
                table: "Resume",
                column: "JobPositionId");

            migrationBuilder.CreateIndex(
                name: "IX_JobPositionQuestions_QuestionsId",
                schema: "dbo",
                table: "JobPositionQuestions",
                column: "QuestionsId");

            migrationBuilder.CreateIndex(
                name: "IX_QuestionAnswer_QuestionId",
                schema: "dbo",
                table: "QuestionAnswer",
                column: "QuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_QuestionAnswer_ResumeId_QuestionId",
                schema: "dbo",
                table: "QuestionAnswer",
                columns: new[] { "ResumeId", "QuestionId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Resume_JobPosition_JobPositionId",
                schema: "dbo",
                table: "Resume",
                column: "JobPositionId",
                principalSchema: "dbo",
                principalTable: "JobPosition",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Resume_JobPosition_JobPositionId",
                schema: "dbo",
                table: "Resume");

            migrationBuilder.DropTable(
                name: "JobPositionQuestions",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "QuestionAnswer",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "JobPosition",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "Question",
                schema: "dbo");

            migrationBuilder.DropIndex(
                name: "IX_Resume_JobPositionId",
                schema: "dbo",
                table: "Resume");

            migrationBuilder.DropColumn(
                name: "AllowDataProcessing",
                schema: "dbo",
                table: "Resume");

            migrationBuilder.DropColumn(
                name: "Email",
                schema: "dbo",
                table: "Resume");

            migrationBuilder.DropColumn(
                name: "FirstName",
                schema: "dbo",
                table: "Resume");

            migrationBuilder.DropColumn(
                name: "JobPositionId",
                schema: "dbo",
                table: "Resume");

            migrationBuilder.DropColumn(
                name: "LastName",
                schema: "dbo",
                table: "Resume");

            migrationBuilder.DropColumn(
                name: "LinkedInUrl",
                schema: "dbo",
                table: "Resume");

            migrationBuilder.DropColumn(
                name: "Phone",
                schema: "dbo",
                table: "Resume");

            migrationBuilder.RenameColumn(
                name: "ResumeFilePath",
                schema: "dbo",
                table: "Resume",
                newName: "Name");
        }
    }
}
