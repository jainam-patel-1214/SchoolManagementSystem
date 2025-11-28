package database

import (
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/joho/godotenv"
)

func InitDb() string {
	rootPath, _ := os.Getwd()
	possiblePaths := []string{
		filepath.Join(rootPath, ".env"),
		filepath.Join(rootPath, "..", ".env"),
	}

	loaded := false
	for _, path := range possiblePaths {
		if err := godotenv.Load(path); err == nil {
			loaded = true
			break
		}
	}

	if !loaded {
		log.Println("⚠️  Warning: .env not found in any known path")
	}

	dbHostdsn := os.Getenv("DSN")
	if dbHostdsn == "" {
		log.Fatal("❌ DSN not found in environment variables")
	}
	fmt.Println("✅ DB Host:", dbHostdsn)
	return dbHostdsn
}
