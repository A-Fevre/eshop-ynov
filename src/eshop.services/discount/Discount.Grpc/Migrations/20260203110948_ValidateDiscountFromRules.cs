using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Discount.Grpc.Migrations
{
    /// <inheritdoc />
    public partial class ValidateDiscountFromRules : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Coupon",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Code = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    Value = table.Column<double>(type: "REAL", nullable: false),
                    Type = table.Column<int>(type: "INTEGER", nullable: false),
                    MinimumOrderAmount = table.Column<double>(type: "REAL", nullable: false),
                    IsCumulative = table.Column<bool>(type: "INTEGER", nullable: false),
                    MaxCumulativePercentage = table.Column<double>(type: "REAL", nullable: false),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    StartDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    EndDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false),
                    AllowOnSaleItems = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Coupon", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Coupon",
                columns: new[] { "Id", "AllowOnSaleItems", "Code", "Description", "EndDate", "IsCumulative", "IsDeleted", "MaxCumulativePercentage", "MinimumOrderAmount", "StartDate", "Status", "Type", "Value" },
                values: new object[] { 1, true, "WELCOME10", "Bienvenue", new DateTime(2026, 12, 31, 23, 59, 59, 0, DateTimeKind.Utc), false, false, 30.0, 50.0, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, 1, 10.0 });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Coupon");
        }
    }
}
