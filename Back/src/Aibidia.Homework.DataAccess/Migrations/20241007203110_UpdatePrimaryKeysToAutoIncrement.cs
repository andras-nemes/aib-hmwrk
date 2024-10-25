using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aibidia.Homework.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePrimaryKeysToAutoIncrement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Name",
                schema: "dbo",
                table: "JobPosition",
                newName: "JobTitle");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                schema: "dbo",
                table: "JobPosition",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "JobTitle",
                schema: "dbo",
                table: "JobPosition",
                newName: "Name");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                schema: "dbo",
                table: "JobPosition",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);
        }
    }
}
